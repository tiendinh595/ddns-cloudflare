import cron from 'node-cron';
let record = 'test.simboutique.vn';
let email = 'tiendinh595@gmail.com';
let api_key = '75a17968ba533c716902ca34775baed7d12eb';
let zone_id = '5d3e2418db6b1bb5131a3e0747333108';

async function getMyIPV4() {
    console.log('get my ip');
    const response = await fetch('https://checkip.amazonaws.com');
    return await response.text();
}

async function getIdentifier() {
    console.log('get identifier');
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records?name=${record}`,
        {
            headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': api_key,
                'Content-Type': 'application/json',
            },
        },
    );
    const data = await response.json();
    return data.result[0].id;
}

async function updateDNS(ip: any, identifier: any) {
    console.log('update dns');
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${identifier}`,
        {
            method: 'PUT',
            headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': api_key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: record,
                type: 'A',
                content: ip,
            }),
        },
    );
    const data = await response.json();
}

function main() {
    getMyIPV4()
        .then((ip) => {
            return ip;
        })
        .then(async (ip) => {
            const identifier = await getIdentifier();
            return { ip, identifier };
        })
        .then(({ ip, identifier }) => {
            return updateDNS(ip, identifier);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            console.log('done');
        });
}

// run every 1 minutes
cron.schedule('*/1 * * * *', () => {
    console.log('running a task every 1 minutes');
    main();
});
const server = Bun.serve({
    port: 3000,
    fetch(request) {
        return new Response('Welcome to Bun!');
    },
});

console.log(`Listening on localhost:${server.port}`);
