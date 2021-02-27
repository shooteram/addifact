import * as core from '@actions/core';
import FormData from 'form-data';
import { createReadStream, readdirSync } from 'fs';
import https, { request } from 'https';
import { join } from 'path';

const run = async () => {
    let project = core.getInput('project'),
        hostname = core.getInput('hostname', { required: true }),
        port = core.getInput('port'),
        url = core.getInput('url', { required: true }),
        token = core.getInput('token', { required: true }),
        path = core.getInput('path', { required: true });

    if (!project) {
        // TODO: get project name from github object
        project = 'test';
    }

    const form = new FormData();
    form.append('project', project);

    const files = readdirSync(path);
    if (!files.length) core.error(`There is no files in "${path}" directory.`);
    files.map(file => form.append(file, createReadStream(join(__dirname, '..', path, file))));

    const options: https.RequestOptions = {
        hostname,
        method: 'POST',
        path: url,
        headers: { 'x-auth-token': token, ...form.getHeaders() },
    };

    if (port !== '') {
        options.port = port;
        hostname = `${hostname}:${port}`;
    }

    const rq = request(options, rs => {
        if (rs.statusCode && (rs.statusCode >= 200 && rs.statusCode < 300)) {
            core.info(`Your files have been uploaded. Here are the links:\n${files.map(file => {
                return `\t - https://${hostname}/@${project}/${file}\n`;
            }).join('')}`);
        } else {
            core.error(`Something went wrong while sending the request (${rs?.statusCode})`);
        }
    });

    rq.on('error', e => { core.error(e) });
    form.pipe(rq).on('finish', () => rq.end());
}

run().catch(core.setFailed);
