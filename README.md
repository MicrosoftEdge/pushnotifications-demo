# pushnotifications-demo

Demo for cross browsers push notifications.

## How to use

This demo requires access to a mongodb instance and a few environment variables:

* `DATABASE_CONNECTION_URI`: The connection string to your `mongodb`
* `VAPID_PUBLIC_KEY`: The public key to share
* `VAPID_PRIVATE_KEY`: The private key to use

If you are using VS Code you can set them in your `launch.json` file as follows:

```js
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch demo",
            "program": "${workspaceFolder}/index.js",
            "env": {
                "DATABASE_CONNECTION_URI": "YOUR CONNECTION STRING",
                "VAPID_PUBLIC_KEY": "YOUR PUBLIC KEY",
                "VAPID_PRIVATE_KEY": "YOUR PRIVATE KEY",
            }
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Job",
            "program": "${workspaceFolder}/App_data/jobs/triggered/notify/index.js",
            "cwd": "${workspaceFolder}/App_data/jobs/triggered/notify",
            "env": {
                "DATABASE_CONNECTION_URI": "YOUR CONNECTION STRING",
                "VAPID_PUBLIC_KEY": "YOUR PUBLIC KEY",
                "VAPID_PRIVATE_KEY": "YOUR PRIVATE KEY",
            }
        }
    ]
}
```

Additionally you can also modify `index.js` and `db/db.js` and set the values there explicitely:

```js
const databaseConnectionURI = process.env.DATABASE_CONNECTION_URI || '';
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
```

To execute the site just run `node index.js` and a server will start in port `4000`