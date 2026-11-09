# МойСклад — Agent OS · OAuth UI

Публичный статический интерфейс для **авторизации**, размещённый на GitHub Pages. В репозитории нет секретов, API-токенов МоегоСклада или персональных данных. Конфиденциальные операции выполняются в Supabase Edge Functions с серверной проверкой пользователя.

- Вход: https://businessmarketolog-web.github.io/
- Экран разрешений: https://businessmarketolog-web.github.io/oauth/consent/
- Клиентские файлы: `index.html`, `app.js`, `config.json` (содержит только публичный publishable key Supabase).

Никогда не хранить в этом репозитории API-токены МоегоСклада, Supabase service role и иные секреты.
