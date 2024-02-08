# Cosmos-governance

Governance proposals notification/alert bot for Cosmos-based chains.
Get all new proposals from any chain you want!

## Requirements

node.js >=17.*

## Setup

```
git clone https://github.com/testnetrunn/cosmos-governance.git
cd cosmos-governance
```

*Installation*
```
npm install
npx prisma db push
cp .env.sample .env
sudo npm install -g pm2
```

edit `.env` file.

edit `settings.json` file for adding new chain.

*Start*
```
npm run dev
```

*Start with daemon/pm2*
```
pm2 start "npm run dev" --name proposalMonitor
```

*Caution*
You need to find your client need governance version on tendermint("v1" or "v1beta1")
