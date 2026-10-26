#!/usr/bin/env python3
"""Install only the protected metadata connection workflow in the existing stack."""
import argparse
import json
import os
import pathlib
import secrets
import subprocess
import tempfile
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
WORKFLOW_ID = "youtubeMetaConnection"
COMPOSE = ["docker", "compose", "-f", str(ROOT / "n8n-docker/compose.yaml")]
URL = "http://127.0.0.1:5678/webhook/youtube-meta-connection"


def wait_for_n8n():
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen("http://127.0.0.1:5678/healthz", timeout=2) as response:
                if response.status == 200:
                    return
        except OSError:
            time.sleep(0.5)
    raise RuntimeError("Az n8n nem lett elérhető 45 másodpercen belül.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=pathlib.Path, default=pathlib.Path(
        os.environ.get("XDG_CONFIG_HOME", pathlib.Path.home() / ".config")
    ) / "film-gombaflow/youtube-meta-update.json")
    args = parser.parse_args()
    config_path = args.config.expanduser().resolve()
    if config_path == ROOT or ROOT in config_path.parents:
        parser.error("A titkos klienskonfiguráció nem kerülhet a repóba.")
    if config_path.exists():
        if config_path.stat().st_mode & 0o077:
            parser.error("A meglévő konfiguráció jogosultsága legyen 600.")
        config = json.loads(config_path.read_text())
        if config.get("webhook_url") != URL or config.get("header_name") != "X-Webhook-Token" or not config.get("header_value"):
            parser.error("A meglévő konfiguráció más webhookhoz tartozik; adj meg külön --config útvonalat.")
    else:
        config = {"webhook_url": URL, "header_name": "X-Webhook-Token", "header_value": secrets.token_urlsafe(32)}
        config_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        descriptor = os.open(config_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w") as destination:
            json.dump(config, destination, indent=2)
            destination.write("\n")
    credential = [{"id": "youtubeMetaHeaderAuth", "name": "YouTube metadata connection Header Auth",
        "type": "httpHeaderAuth", "data": {"name": config["header_name"], "value": config["header_value"]}}]
    # Apply current mounts before import even if the running container predates them.
    subprocess.run(COMPOSE + ["up", "-d", "--no-deps", "n8n"], check=True)
    wait_for_n8n()
    # Plaintext credential only exists in owner-only temporary files; never log it.
    with tempfile.TemporaryDirectory(prefix="youtube-meta-install-", dir="/tmp") as folder:
        local = pathlib.Path(folder) / "credential.json"
        descriptor = os.open(local, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w") as destination:
            json.dump(credential, destination)
        remote = "/tmp/" + pathlib.Path(folder).name + ".json"
        try:
            subprocess.run(COMPOSE + ["exec", "-T", "n8n", "sh", "-c", 'umask 077; cat > "$1"',
                "sh", remote], input=local.read_bytes(), check=True)
            subprocess.run(COMPOSE + ["exec", "-T", "n8n", "n8n", "import:credentials", "--input=" + remote], check=True)
        finally:
            subprocess.run(COMPOSE + ["exec", "-T", "n8n", "rm", "-f", remote], check=False)
    env = dict(os.environ, WORKFLOW_ID=WORKFLOW_ID)
    subprocess.run(["make", "-C", str(ROOT / "n8n-workflows"), "import"], env=env, check=True)
    subprocess.run(COMPOSE + ["exec", "-T", "n8n", "n8n", "publish:workflow", "--id=" + WORKFLOW_ID], check=True)
    print("Az n8n szolgáltatás rövid újraindítása az új webhook aktiválásához.", flush=True)
    subprocess.run(COMPOSE + ["restart", "n8n"], check=True)
    wait_for_n8n()
    subprocess.run(["make", "-C", str(ROOT / "n8n-workflows"), "export"], env=env, check=True)
    exported = ROOT / "n8n-workflows/workflows" / (WORKFLOW_ID + ".json")
    exported.write_text(json.dumps(json.loads(exported.read_text()), indent=2, ensure_ascii=False) + "\n")
    print(f"Webhook kész: {URL}\nKlienskonfiguráció: {config_path}")


if __name__ == "__main__":
    main()
