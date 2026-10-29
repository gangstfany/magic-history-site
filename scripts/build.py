from pathlib import Path
import argparse,json,subprocess,shutil
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--auth-dir',type=Path,default=ROOT.parent/'magic-history-auth');p.add_argument('--local',action='store_true');args=p.parse_args()
release=json.loads((ROOT/'auth-release.json').read_text());auth=args.auth_dir.resolve()
revision=subprocess.check_output(['git','-C',str(auth),'rev-parse','HEAD'],text=True).strip()
if revision!=release['commit']:raise SystemExit('Account release does not match auth-release.json. Use the pinned commit; do not silently bundle main.')
if subprocess.check_output(['git','-C',str(auth),'status','--porcelain','--untracked-files=no'],text=True).strip():raise SystemExit('Account source has uncommitted changes; refusing to change pinned login code.')
manifest=json.loads((auth/'auth-manifest.json').read_text())
out=ROOT/'_site';shutil.rmtree(out,ignore_errors=True);out.mkdir()
for name in ['index.html','shell.css','shell.mjs','favorites.mjs','favorites-ui.mjs','module-protocol.mjs','modules.json','og-cover.png','assets']:
 source=ROOT/name
 if source.is_dir():shutil.copytree(source,out/name)
 else:shutil.copy2(source,out/name)
for name in manifest['consumerFiles']:
 relative=Path(name)
 if relative.is_absolute() or '..'in relative.parts or not(name.startswith('assets/auth/')or name.startswith('assets/vendor/')or name=='auth-callback.html'):raise SystemExit('Invalid account manifest path: '+name)
 source=auth/relative
 if source.is_symlink()or not source.is_file():raise SystemExit('Missing or invalid account release file: '+name)
 target=out/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
if args.local:
 config=json.loads((out/'modules.json').read_text());config['modules']['world']['url']='http://127.0.0.1:8032/';config['modules']['euro']['url']='http://127.0.0.1:8060/';config['modules']['art']['url']='http://127.0.0.1:8036/art-history-map.html?embed=1';(out/'modules.json').write_text(json.dumps(config,ensure_ascii=False,indent=2))
(out/'.nojekyll').touch()
(out/'release.json').write_text(json.dumps({'accountCommit':revision,'courses':'independently deployed runtime URLs'},indent=2))
print('Built homepage with pinned account release '+revision)
