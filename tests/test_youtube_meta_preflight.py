"""CLI → isolated native n8n workflow → test YouTube API; never real OAuth."""
import json
import pathlib
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from test_youtube_meta_connection import CONFIG, ROOT, CLI

COMPOSE = ['docker', 'compose', '-f', str(ROOT / 'n8n-docker/compose.yaml')]
TEST_ID = 'youtubeMetaPreflightTest'


def docker(*args, **kwargs):
    return subprocess.run(COMPOSE + list(args), text=True, capture_output=True, check=True, timeout=60, **kwargs)


def wait_for_webhook(url):
    deadline = time.monotonic() + 40
    while True:
        try:
            urllib.request.urlopen(urllib.request.Request(url,data=b'',method='POST'),timeout=2)
        except urllib.error.HTTPError as error:
            if error.code in (401,403): return
            if time.monotonic() >= deadline: raise
        except OSError:
            if time.monotonic() >= deadline: raise
        time.sleep(0.3)


class YoutubeMetaPreflightFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder = tempfile.TemporaryDirectory(prefix='youtube-preflight-test-', dir='/tmp')
        cls.addClassCleanup(cls.folder.cleanup)
        workflow = json.loads((ROOT / 'n8n-workflows/workflows/youtubeMetaConnection.json').read_text())
        reads = [n for n in workflow['nodes'] if n['type'] == 'n8n-nodes-base.httpRequest']
        if len(reads) != 3:
            raise RuntimeError('Expected 3 native read-only YouTube HTTP nodes')
        workflow['id'] = TEST_ID
        workflow['name'] = 'Isolated YouTube preflight test (no OAuth)'
        workflow['active'] = False
        for key in ('versionId', 'activeVersionId', 'shared', 'createdAt', 'updatedAt'):
            workflow.pop(key, None)
        for node in workflow['nodes']:
            if node['name'] == 'Validate YouTube channel':
                # Model the native HTTP node's OAuth/transport error output with
                # a dummy fixture, without touching any real OAuth credential.
                node['parameters']['command'] = node['parameters']['command'].replace(
                    'api: $json', 'api: ($json.body?.nativeError ? {error: $json.body.nativeError} : $json)')
            if node['type'] == 'n8n-nodes-base.webhook':
                node['parameters']['path'] = 'youtube-meta-preflight-test'
                node['webhookId'] = TEST_ID
            if node in reads:
                node['credentials'] = {}
                node['parameters']['authentication'] = 'none'
                endpoint = node['parameters']['url'].rsplit('/', 1)[1]
                node['parameters']['url'] = 'http://127.0.0.1:18765/youtube/v3/' + endpoint
                node['parameters']['queryParameters']['parameters'].append(
                    {'name':'_case', 'value':"={{ $('Parse result').first().json.preflight.meta.videoId }}"})
                node['parameters']['options']['timeout'] = 250
        config = json.loads(CONFIG.read_text())
        config['webhook_url'] = 'http://127.0.0.1:5678/webhook/youtube-meta-preflight-test'
        cls.config_path = pathlib.Path(cls.folder.name) / 'config.json'
        cls.config_path.write_text(json.dumps(config))
        cls.config_path.chmod(0o600)
        docker('exec','-T','n8n','sh','-c','cat > /tmp/youtube-preflight-test.json',input=json.dumps([workflow]))
        fixture = (ROOT / 'tests/fixtures/youtube-preflight-api.js').read_text()
        docker('exec','-T','n8n','sh','-c','cat > /tmp/youtube-preflight-api.js',input=fixture)
        docker('exec','-T','n8n','n8n','import:workflow','--input=/tmp/youtube-preflight-test.json')
        cls.addClassCleanup(cls.cleanup_workflow)
        docker('exec','-T','n8n','n8n','publish:workflow','--id='+TEST_ID)
        docker('restart','n8n')
        # Container restart removes the isolated stub process, so start it afterwards.
        docker('exec','-d','n8n','node','/tmp/youtube-preflight-api.js')
        wait_for_webhook(config['webhook_url'])

    @classmethod
    def cleanup_workflow(cls):
        docker('exec','-T','n8n','n8n','unpublish:workflow','--id='+TEST_ID)
        docker('restart','n8n')
        docker('exec','-T','n8n','rm','-f','/tmp/youtube-preflight-api.js',
            '/tmp/youtube-preflight-api.log','/tmp/youtube-preflight-test.json')
        wait_for_webhook(json.loads(CONFIG.read_text())['webhook_url'])

    def invoke(self, scenario):
        folder = tempfile.TemporaryDirectory(prefix='youtube-preflight-meta-', dir='/tmp')
        self.addCleanup(folder.cleanup)
        path = pathlib.Path(folder.name) / 'meta.json'
        meta = json.loads((ROOT / 'local-workflows/youtube-meta-update/examples/connection-check.json').read_text())
        meta.update(videoId=scenario, playlistId='test-playlist', youtube_scheduled_at='2099-01-01T16:00:00+01:00')
        path.write_text(json.dumps(meta))
        before = path.read_bytes()
        result = subprocess.run(['python3',str(CLI),'preflight',str(path),'--config',str(self.config_path)],
            text=True,capture_output=True,check=False,timeout=15)
        self.assertEqual(path.read_bytes(),before,'Preflight must not alter local metadata')
        self.assertTrue(result.stdout,result.stderr)
        body = json.loads(result.stdout)
        self.assertIn('youtubeModified',body,body)
        self.assertFalse(body['youtubeModified'])
        return result, body

    def failed_execution(self, execution_id):
        import time
        query = """const db=new (require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3').Database)('/home/node/.n8n/database.sqlite');db.get('SELECT status FROM execution_entity WHERE id=? AND workflowId=?',[process.argv[1],process.argv[2]],(e,r)=>{if(e)throw e;console.log(JSON.stringify(r));db.close()});"""
        deadline=time.monotonic()+5
        while True:
            out=docker('exec','-T','n8n','node','-e',query,str(execution_id),TEST_ID)
            if json.loads(out.stdout).get('status')=='error': return
            if time.monotonic()>deadline: self.fail('n8n execution did not fail')
            time.sleep(.1)

    def test_private_unscheduled_video_passes_without_writes(self):
        result,body=self.invoke('success')
        self.assertEqual(result.returncode,0,body)
        self.assertEqual(body['status'],'validated')
        self.assertEqual(body['step'],'youtube-preflight')
        log=docker('exec','-T','n8n','cat','/tmp/youtube-preflight-api.log').stdout
        entries=[json.loads(line) for line in log.splitlines()]
        self.assertTrue(entries)
        self.assertTrue(all(e['method']=='GET' and not e['authorization'] for e in entries))

    def test_rejected_video_states_and_identity_fail_as_n8n_errors(self):
        for scenario,code in [('public','VIDEO_NOT_PRIVATE'),('scheduled','VIDEO_ALREADY_SCHEDULED'),
            ('wrong-auth','AUTH_CHANNEL_MISMATCH'),('wrong-video-channel','VIDEO_CHANNEL_MISMATCH'),
            ('missing-video','VIDEO_NOT_FOUND'),('missing-playlist','PLAYLIST_NOT_FOUND')]:
            with self.subTest(scenario=scenario):
                result,body=self.invoke(scenario)
                self.assertEqual(result.returncode,1,body)
                self.assertEqual(body['code'],code)
                self.failed_execution(body['executionId'])

    def test_api_error_and_timeout_preserve_error_details(self):
        result,body=self.invoke('native-auth-error')
        self.assertEqual(result.returncode,1)
        self.assertEqual(body['step'],'youtube-channel')
        self.assertEqual(body['youtubeError']['code'],'invalid_grant')
        self.assertIn('Refresh token revoked',body['youtubeError']['message'])
        self.assertLessEqual(len(body['youtubeError']['message']),400)
        self.assertNotIn('fake-',json.dumps(body))
        self.assertNotIn('Authorization',json.dumps(body))
        self.failed_execution(body['executionId'])
        result,body=self.invoke('api-error')
        self.assertEqual(result.returncode,1)
        self.assertEqual(body['step'],'youtube-channel')
        self.assertEqual(body['youtubeError']['code'],403)
        self.assertIn('quota',body['youtubeError']['message'].lower())
        self.failed_execution(body['executionId'])
        result,body=self.invoke('timeout')
        self.assertEqual(result.returncode,1)
        self.assertEqual(body['step'],'youtube-channel')
        self.assertEqual(body['code'],'YOUTUBE_REQUEST_FAILED')
        self.failed_execution(body['executionId'])
