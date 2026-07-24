# fitapp — suggested commands

## Environment
- OS: Windows 11
- Shell: PowerShell
- Project root: `d:\Project\myprog\fitapp`

## Cursor / agent utilities
```powershell
cd d:\Project\myprog\fitapp
node .cursor/scripts/decode-ukrainian-en-layout.mjs --check
```

## Serena
```powershell
cd d:\Project\myprog\fitapp
# optional CLI if serena installed: serena memories check
```

## Application (after scaffold)
Expected commands once Next.js is initialized:
```powershell
npm install
npm run dev      # only when user asks
npm run lint
npm run build
npx tsc --noEmit
```

## Database (Prisma path)
Local Postgres password per user rules: set in `.env` only.
Never run `prisma migrate` without explicit user confirmation.

## Git
Standard git on Windows; workflow files via local git push, not GitHub MCP.
