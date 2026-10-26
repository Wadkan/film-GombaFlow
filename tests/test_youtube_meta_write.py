"""CLI → isolated native n8n → stubbed YouTube writes, never real OAuth."""
import concurrent.futures
import datetime
import json
import pathlib
import tempfile
import subprocess
import unittest
import uuid
import urllib.request
import urllib.error
from test_youtube_meta_preflight import docker, wait_for_webhook
from test_youtube_meta_connection import CONFIG, ROOT, CLI

TEST_ID = 'youtubeMetaWriteTest'
VIDEO = '-8QDeHKJNT8'

class YoutubeMetaWriteFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder = tempfile.TemporaryDirectory(prefix='youtube-write-test-',dir='/tmp')
        cls.addClassCleanup(cls.folder.cleanup)
        cls.state_dir='/tmp/youtube-write-state-'+uuid.uuid4().hex
        workflow=json.loads((ROOT/'n8n-workflows/workflows/youtubeMetaConnection.json').read_text())
        assert any(n['name']=='YouTube update request' for n in workflow['nodes']), 'Native update node missing'
        workflow.update(id=TEST_ID,name='Isolated YouTube write test (no OAuth)',active=False)
        for key in ('versionId','activeVersionId','shared','createdAt','updatedAt'): workflow.pop(key,None)
        for node in workflow['nodes']:
            if node['type']=='n8n-nodes-base.webhook':
                node['parameters']['path']='youtube-meta-write-test';node['webhookId']=TEST_ID
            if node['type']=='n8n-nodes-base.executeCommand':
                node['parameters']['command']=node['parameters']['command'].replace('timeout ', 'YOUTUBE_META_STATE_DIR='+cls.state_dir+' timeout ',1)
            if node['type']=='n8n-nodes-base.httpRequest':
                node['credentials']={};node['parameters']['authentication']='none'
                if node['name'] in ('YouTube update request','YouTube update read'):
                    node['parameters']['url']="={{ 'http://127.0.0.1:18766/youtube/v3/' + $json.action.endpoint }}"
                    node['parameters']['jsonQuery']="={{ JSON.stringify({...$json.action.query, _case: $('Protected webhook').first().json.body.tags[0]}) }}"
                    node['parameters']['options']['timeout']="={{ $('Protected webhook').first().json.body.tags[0] === 'expiring-partial' ? 15000 : ($('Protected webhook').first().json.body.tags[0] === 'expiring' ? 2000 : 300) }}"
                else:
                    node['parameters']['url']='http://127.0.0.1:18766/youtube/v3/'+node['parameters']['url'].rsplit('/',1)[1]
        cfg=json.loads(CONFIG.read_text());cfg['webhook_url']='http://127.0.0.1:5678/webhook/youtube-meta-write-test'
        cls.config_path=pathlib.Path(cls.folder.name)/'config.json';cls.config_path.write_text(json.dumps(cfg));cls.config_path.chmod(0o600)
        docker('exec','-T','n8n','sh','-c','cat > /tmp/youtube-write-test.json',input=json.dumps([workflow]))
        docker('exec','-T','n8n','sh','-c','cat > /tmp/youtube-write-api.js',input=(ROOT/'tests/fixtures/youtube-write-api.js').read_text())
        docker('exec','-T','n8n','n8n','import:workflow','--input=/tmp/youtube-write-test.json')
        cls.addClassCleanup(cls.cleanup_workflow)
        docker('exec','-T','n8n','n8n','publish:workflow','--id='+TEST_ID)
        docker('restart','n8n');docker('exec','-d','n8n','env','YOUTUBE_META_STATE_DIR='+cls.state_dir,'node','/tmp/youtube-write-api.js');wait_for_webhook(cfg['webhook_url'])

    @classmethod
    def cleanup_workflow(cls):
        docker('exec','-T','n8n','n8n','unpublish:workflow','--id='+TEST_ID)
        docker('restart','n8n');docker('exec','-T','n8n','rm','-rf',cls.state_dir,'/tmp/youtube-write-api.js','/tmp/youtube-write-api.log','/tmp/youtube-write-test.json')
        wait_for_webhook(json.loads(CONFIG.read_text())['webhook_url'])

    def invoke(self,scenario,video=VIDEO,clear=True,publish_after=None):
        if clear: docker('exec','-T','n8n','rm','-rf',self.state_dir)
        meta=json.loads((ROOT/'local-workflows/youtube-meta-update/examples/connection-check.json').read_text())
        meta.update(videoId=video,title='Updated test title',description='Updated test description',tags=[scenario],playlistId='test-playlist',youtube_scheduled_at='2099-01-01T16:00:00+01:00')
        if publish_after is not None:
            meta['youtube_scheduled_at']=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(seconds=publish_after)).isoformat()
        path=pathlib.Path(self.folder.name)/(uuid.uuid4().hex+'.json');path.write_text(json.dumps(meta))
        run=subprocess.run(['python3',str(CLI),'update',str(path),'--config',str(self.config_path)],text=True,capture_output=True,timeout=20)
        self.assertTrue(run.stdout,run.stderr)
        response=json.loads(run.stdout);saved=json.loads(path.read_text())
        self.assertEqual(saved['status'],response['status'])
        for key,value in meta.items():
            if key!='status':self.assertEqual(saved[key],value)
        state_output=docker('exec','-T','n8n','node','-e',"const fs=require('node:fs'),p=require('node:path');const d=process.argv[1];console.log(JSON.stringify(fs.existsSync(d)?fs.readdirSync(d).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(p.join(d,n),'utf8'))):[]));",self.state_dir).stdout
        states=json.loads(state_output)
        if response.get('code') not in ('VIDEO_NOT_ALLOWED','VIDEO_RESERVED'):
            self.assertEqual(states[0]['status'],response['status'])
            self.assertEqual(states[0]['executionId'],str(response['executionId']))
        return run,response,path,meta

    def entries(self,scenario):
        raw=docker('exec','-T','n8n','cat','/tmp/youtube-write-api.log').stdout
        return [e for e in map(json.loads,raw.splitlines()) if e.get('scenario')==scenario]

    def failed(self,execution_id):
        import time
        query="const db=new (require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3').Database)('/home/node/.n8n/database.sqlite');db.get('SELECT status FROM execution_entity WHERE id=? AND workflowId=?',[process.argv[1],process.argv[2]],(e,r)=>{if(e)throw e;console.log(JSON.stringify(r));db.close()});"
        deadline=time.monotonic()+5
        while True:
            result=docker('exec','-T','n8n','node','-e',query,str(execution_id),TEST_ID)
            if json.loads(result.stdout).get('status')=='error':return
            if time.monotonic()>deadline:self.fail('n8n error execution missing')
            time.sleep(.1)

    def test_update_success_membership_skip_and_fresh_guards(self):
        for scenario,inserts in [('success',1),('member',0),('verify-tags-omitted',1)]:
            with self.subTest(scenario=scenario):
                run,body,path,meta=self.invoke(scenario)
                self.assertEqual(run.returncode,0,body);self.assertEqual(body['status'],'updated');self.assertTrue(body['youtubeModified']);self.assertFalse(body['partialSuccess'])
                entries=self.entries(scenario);writes=[e for e in entries if e['method']!='GET']
                self.assertEqual(sum(e['method']=='POST' for e in writes),inserts);self.assertEqual(sum(e['method']=='PUT' for e in writes),1)
                if scenario=='verify-tags-omitted':
                    update=next(e for e in writes if e['method']=='PUT')
                    self.assertEqual(update['requestBody']['snippet']['tags'],['verify-tags-omitted'])
                self.assertTrue(all(not e['authorization'] for e in entries))
                for index,entry in enumerate(entries):
                    if entry['method']!='GET':
                        self.assertEqual(entries[index-1]['endpoint'],'videos');self.assertEqual(entries[index-1]['method'],'GET')
                        self.assertEqual(entry['videoId'],VIDEO);self.assertTrue(entry['reservedBeforeWrite'])
                retry=subprocess.run(['python3',str(CLI),'update',str(path),'--config',str(self.config_path)],capture_output=True,text=True)
                self.assertEqual(retry.returncode,2)

    def test_unsafe_states_allowlist_and_duplicate_never_write(self):
        for scenario,code in [('public','VIDEO_NOT_PRIVATE'),('scheduled','VIDEO_ALREADY_SCHEDULED'),('wrong-auth','AUTH_CHANNEL_MISMATCH'),('wrong-video-channel','VIDEO_CHANNEL_MISMATCH'),('guard-public','VIDEO_NOT_PRIVATE')]:
            with self.subTest(scenario=scenario):
                run,body,_,_=self.invoke(scenario);self.assertEqual(run.returncode,1,body);self.assertEqual(body['code'],code);self.failed(body['executionId'])
                self.assertFalse(any(e['method']!='GET' for e in self.entries(scenario)))
        run,body,_,_=self.invoke('not-allowed',video='GvZA_M9qxps')
        self.assertEqual(body['code'],'VIDEO_NOT_ALLOWED');self.assertFalse(body['youtubeModified']);self.failed(body['executionId'])
        self.assertEqual(self.entries('not-allowed'),[])
        first=self.invoke('duplicate');second=self.invoke('duplicate',clear=False)
        self.assertEqual(first[1]['status'],'updated');self.assertEqual(second[1]['code'],'VIDEO_RESERVED');self.failed(second[1]['executionId'])
        self.assertEqual(sum(e['method']=='PUT' for e in self.entries('duplicate')),1)

    def test_partial_failure_uncertainty_verification_and_parallel_exclusion(self):
        # A valid input can expire during preflight. A second case leaves a
        # confirmed playlist insertion but no longer enough PUT safety margin.
        for scenario,seconds,partial in [('expiring',1,False),('expiring-partial',25,True)]:
            with self.subTest(scenario=scenario):
                run,body,_,_=self.invoke(scenario,publish_after=seconds)
                self.assertEqual(run.returncode,1,body)
                self.assertEqual(body['status'],'error')
                self.assertEqual(body['code'],'PUBLISH_TIME_TOO_CLOSE')
                self.assertEqual(body['partialSuccess'],partial)
                self.assertEqual(body['completedSteps'],['playlist-insert'] if partial else [])
                entries=self.entries(scenario)
                self.assertFalse(any(e['method']=='PUT' for e in entries),'Expired/unsafe publishAt must not reach videos.update')
                self.assertEqual(sum(e['method']=='POST' for e in entries),1 if partial else 0)
                self.failed(body['executionId'])
        for scenario,status,code in [('partial','error','YOUTUBE_API_ERROR'),('write-timeout','unknown','YOUTUBE_REQUEST_FAILED'),('verify-mismatch','unknown','VERIFICATION_FAILED')]:
            with self.subTest(scenario=scenario):
                run,body,_,_=self.invoke(scenario);self.assertEqual(run.returncode,1,body);self.assertEqual(body['status'],status);self.assertEqual(body['code'],code);self.failed(body['executionId'])
                entries=self.entries(scenario);self.assertEqual(sum(e['method']=='PUT' for e in entries),1)
                if scenario=='partial':self.assertTrue(body['partialSuccess'])
                if scenario=='verify-mismatch':self.assertEqual(sum(e['endpoint']=='videos' and e.get('afterWrite') for e in entries),3)
        docker('exec','-T','n8n','rm','-rf',self.state_dir)
        meta=json.loads((ROOT/'local-workflows/youtube-meta-update/examples/connection-check.json').read_text())
        meta.update(videoId=VIDEO,title='Updated test title',description='Updated test description',tags=['parallel'],playlistId='test-playlist',youtube_scheduled_at='2099-01-01T16:00:00+01:00')
        cfg=json.loads(self.config_path.read_text())
        def request(_):
            req=urllib.request.Request(cfg['webhook_url'],data=json.dumps(meta).encode(),headers={'Content-Type':'application/json',cfg['header_name']:cfg['header_value']},method='POST')
            try:
                with urllib.request.urlopen(req,timeout=20) as response:return json.loads(response.read())
            except urllib.error.HTTPError as error:return json.loads(error.read())
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            outcomes=list(pool.map(request,range(2)))
        self.assertEqual(sorted(o['status'] for o in outcomes),['error','updated'])
        self.assertEqual(sum(e['method']=='PUT' for e in self.entries('parallel')),1)
