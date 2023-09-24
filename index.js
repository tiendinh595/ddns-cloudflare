const cron = require('node-cron');
let email = 'tiendinh595@gmail.com';
let api_key = '75a17968ba533c716902ca34775baed7d12eb';
let configs = [
    {
        zone_id: '5d3e2418db6b1bb5131a3e0747333108',
        records: [
            'api.simboutique.vn',
            'www.api.simboutique.vn',
            'tools.simboutique.vn',
            'www.tools.simboutique.vn',
        ],
    },
    {
        zone_id: 'd62228e6cdc6dae66eea779637a25fa2',
        records: ['dinhvt.pro', 'nginx.dinhvt.pro', 'www.nginx.dinhvt.pro'],
    },
    {
        zone_id: '29f7567c3e1e4bdd24252e8f264cc034',
        records: [
            'api.bankmate.vn',
            'www.api.bankmate.vn',
            'app.bankmate.vn',
            'www.app.bankmate.vn',
        ],
    },
];

async function getMyIPV4() {
    console.log('get my ip');
    const response = await fetch('https://checkip.amazonaws.com');
    return await response.text();
}

async function getIdentifier(zone_id, record) {
    console.log('get identifier', { record });
    try {
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
    } catch (error) {
        return null;
    }
}

async function updateDNS(zone_id, record, ip, identifier) {
    console.log('update dns', { record, ip, identifier });
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

async function main() {
    let ip = await getMyIPV4();
    ip = ip.trim();
    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        for (let j = 0; j < config.records.length; j++) {
            const record = config.records[j];
            let zoo_id = config.zone_id;
            let identifier = await getIdentifier(zoo_id, record);
            if (identifier) {
                console.log('found identifier', { record, identifier });
                await updateDNS(zoo_id, record, ip, identifier);
            } else {
                console.log('not found identifier', { record });
            }
            console.log('=====================');
        }
    }
}

// run every 1 minutes
cron.schedule('*/1 * * * *', () => {
    console.log('start run ');
    main()
        .finally(() => {
            console.log('end run ');
        })
        .catch((error) => {
            console.log('error', error);
        });
});
