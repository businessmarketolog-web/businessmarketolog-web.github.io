import {createClient} from "https://esm.sh/@supabase/supabase-js@2.119.0?bundle";
const el=id=>document.getElementById(id),notice=x=>el("notice").textContent=x,show=(id,on)=>el(id).hidden=!on;
let sb,session,authId,base;
async function status(){
 const r=await fetch(base+"/credentials",{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});
 const x=await r.json();
 notice(x.connected?"Доступ к МоемуСкладу сохранён.":"Войдите в МойСклад с API-токеном.");
 show("consent",!!x.connected&&!!authId);
}
async function consent(){
 const {data,error}=await sb.auth.oauth.getAuthorizationDetails(authId);
 if(error){notice(error.message);return}
 if(!data){notice("Запрос не найден");return}
 if("redirect_url" in data){location.assign(data.redirect_url);return}
 el("client").textContent=data.client?.client_name||data.client?.name||"ChatGPT";
 el("scopes").textContent=String(data.scope||"").replaceAll(" "," · ");
}
async function start(){
 const cfg=await (await fetch("/config.json",{cache:"no-store"})).json();
 base=cfg.base;authId=new URL(location.href).searchParams.get("authorization_id");
 sb=createClient(cfg.url,cfg.anon,{auth:{persistSession:true,detectSessionInUrl:true}});
 const {data,error}=await sb.auth.getSession();session=data.session;
 if(error)notice(error.message);
 show("login",!session);show("settings",!!session);
 if(!session){notice("Войдите по электронной почте.");return}
 el("identity").textContent=session.user.email||"Подключено";
 await status();if(authId)await consent();
}
el("login-form").addEventListener("submit",async e=>{
 e.preventDefault();notice("Отправляю письмо...");
 const {error}=await sb.auth.signInWithOtp({email:el("email").value.trim(),options:{emailRedirectTo:location.href,shouldCreateUser:true}});
 notice(error?"Ошибка: "+error.message:"Письмо отправлено. Перейдите по ссылке из письма.");
});
el("token-form").addEventListener("submit",async e=>{
 e.preventDefault();const token=el("token").value.trim();el("save").disabled=true;notice("Проверяю токен...");
 try {
 const r=await fetch(base+"/credentials",{method:"POST",headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify({token})});
 const out=await r.json();el("token").value="";
 notice(r.ok?"Токен проверен и зашифрован.":out.error||"Ошибка подключения");
 if(r.ok){await status();if(authId)await consent();}
 }catch{notice("Нет соединения с сервером.");}
 el("save").disabled=false;
});
el("approve").addEventListener("click",async()=>{
 el("approve").disabled=true;
 const {data,error}=await sb.auth.oauth.approveAuthorization(authId);
 if(error){notice(error.message);el("approve").disabled=false;return}
 if(data?.redirect_url)location.assign(data.redirect_url);
});
el("deny").addEventListener("click",async()=>{
 const {data}=await sb.auth.oauth.denyAuthorization(authId);if(data?.redirect_url)location.assign(data.redirect_url);
});
el("logout").addEventListener("click",async()=>{await sb.auth.signOut();location.replace(base);});
start().catch(e=>notice("Ошибка загрузки страницы. Обновите страницу."));
