# pushnotifications-demo

Demo for cross browsers push notifications.

## How to use

This demo requires access to a mongodb instance and a few environment variables:

* `connectionString`: The connection string to your `mongodb`
* `publickey`: The public key to share
* `privatekey`: The private key to use

If you are using VS Code you can set them in your `launch.json` file as follows:

```js
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch demo",
            "program": "${workspaceFolder}\\index.js",
            "env": {
                "connectionString": "YOUR CONNECTION STRING",
                "publickey": "YOUR PUBLIC KEY",
                "privatekey": "YOUR PRIVATE KEY",
            }
        }
    ]
}
```

Additionally you can also modify `index.js` and `db/db.js` and set the values there explicitely:

```js
const connectionString = process.env.connectionString || 'YOUR CONNECTION STRING';
const public = process.env.publickey || 'PUBLIC KEY';
const private = process.env.privatekey || 'PRIVATE KEY';
```

To execute the site just run `node index.js` and a server will start in port `4000`