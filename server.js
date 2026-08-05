// 漫画日本語塾 - 局域网预览服务器（含进度同步 API）
// 手机与电脑连同一 Wi-Fi 后，浏览器打开 http://<电脑IP>:8791
// 掌握进度通过 /api/progress 保存在本机 progress.json，PC 与手机自动互相同步。
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
const dataFile=path.join(root,'progress.json');

function readProgress(){
  try{return JSON.parse(fs.readFileSync(dataFile,'utf8'));}catch(e){return {};}
}
function writeProgress(obj){
  try{fs.writeFileSync(dataFile,JSON.stringify(obj));return true;}catch(e){return false;}
}

http.createServer((req,res)=>{
  const url=req.url.split('?')[0];
  if(url==='/api/progress'){
    if(req.method==='GET'){
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
      res.end(JSON.stringify(readProgress()));
      return;
    }
    if(req.method==='POST'){
      let body='';
      req.on('data',c=>{body+=c;if(body.length>1e6)req.destroy();});
      req.on('end',()=>{
        try{
          const incoming=JSON.parse(body);
          const cur=readProgress();
          ['grammar','patterns','vocab','giseigo'].forEach(k=>{
            const set=new Set([...(cur[k]||[]),...(incoming[k]||[])]);
            cur[k]=[...set];
          });
          writeProgress(cur);
          res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});
          res.end(JSON.stringify(cur));
        }catch(e){
          res.writeHead(400);res.end('bad json');
        }
      });
      return;
    }
    res.writeHead(405);res.end();
    return;
  }
  let p=decodeURIComponent(url);
  if(p==='/')p='/index.html';
  const file=path.join(root,p);
  if(!file.startsWith(root)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
}).listen(8791,'0.0.0.0',()=>console.log('MangaJp server running on http://0.0.0.0:8791'));
