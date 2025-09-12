(function(){
    async function sc(){
      try{
        if(document.cookie.split('; ').some(c=>c.startsWith('gncl_accepted='))||localStorage.getItem('gncl_accepted')==='true'||('caches' in window&&await caches.open('gncl-cache').then(c=>c.match('/LICENSE').then(Boolean).catch(()=>false))))return true;
      }catch(e){}
      let text=null;
      try{
        const resp=await fetch('/LICENSE',{cache:'no-store'});
        text=resp.ok?await resp.text():`License file not found (HTTP ${resp.status}).`;
      }catch(e){
        text='Unable to fetch license file from origin.';
      }
      const modal=document.createElement('div');
      Object.assign(modal.style,{position:'fixed',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',zIndex:2147483647,padding:'24px',boxSizing:'border-box'});
      modal.id='gncl-modal';
      const box=document.createElement('div');
      Object.assign(box.style,{width:'min(900px,100%)',maxHeight:'80vh',overflow:'hidden',background:'#fff',borderRadius:'12px',boxShadow:'0 12px 48px rgba(0,0,0,.35)',display:'flex',flexDirection:'column'});
      const header=document.createElement('div');
      header.textContent='Project License — please review';
      Object.assign(header.style,{padding:'12px 16px',fontWeight:700,borderBottom:'1px solid #e6e6e6'});
      box.appendChild(header);
      const contentWrap=document.createElement('div');
      Object.assign(contentWrap.style,{padding:'12px 16px',overflow:'auto',background:'#fafafa',flex:'1 1 auto'});
      const pre=document.createElement('pre');
      pre.style.whiteSpace='pre-wrap';
      pre.style.wordBreak='break-word';
      pre.style.margin=0;
      pre.style.fontFamily='ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace';
      pre.textContent=text;
      contentWrap.appendChild(pre);
      box.appendChild(contentWrap);
      const row=document.createElement('div');
      Object.assign(row.style,{display:'flex',justifyContent:'flex-end',gap:'8px',padding:'12px 16px',borderTop:'1px solid #e6e6e6',background:'#fff'});
      const noBtn=document.createElement('button');
      noBtn.textContent='No';
      Object.assign(noBtn.style,{padding:'8px 12px',borderRadius:'8px',border:'1px solid #d33',background:'#fff',color:'#d33',cursor:'pointer'});
      noBtn.addEventListener('click',()=>{try{window.location.href='https://geoloup.com/no'}catch(e){}});
      const yesBtn=document.createElement('button');
      yesBtn.textContent='Yes';
      Object.assign(yesBtn.style,{padding:'8px 12px',borderRadius:'8px',border:'none',background:'#0b6fbf',color:'#fff',cursor:'pointer'});
      yesBtn.addEventListener('click',async ()=>{
        try{const d=new Date();d.setTime(d.getTime()+365*24*60*60*1000);document.cookie=`gncl_accepted=true; expires=${d.toUTCString()}; path=/; samesite=lax`}catch(e){}
        try{localStorage.setItem('gncl_accepted','true')}catch(e){}
        try{if('caches' in window){const cache=await caches.open('gncl-cache');await cache.put('/LICENSE',new Response(text,{headers:{'Content-Type':'text/plain'}}))}}catch(e){}
        try{modal.remove()}catch(e){}
      });
      row.appendChild(noBtn);
      row.appendChild(yesBtn);
      box.appendChild(row);
      modal.appendChild(box);
      document.documentElement.appendChild(modal);
      yesBtn.focus();
      return false;
    }
    window.sc=sc;
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{window.sc()}, {once:true})}else window.sc();
  })();
  