const fs = require('fs');
const { resolve } = require('path');
const yaml = require('yaml');

const filePath = pathName => {
	if (pathName) {
		return resolve(process.cwd(), pathName);
	}

	return resolve(process.cwd());
};

var releaseYaml = {
	name: "Publish Release",

	on: {
		push: {
			"tags": ['*']
			// branches: ['dev', 'master']
		}
	},
	jobs: {
		release: {
			"runs-on": "ubuntu-18.04",
			steps: [
				{
					"uses": "actions/checkout@v2"
				},
				{
					"name": "Get release version",
					"id": "get_release_version",
					"run": "echo ::set-output name=VERSION::${GITHUB_REF#refs/tags/}"
				},
				{
					"name": "Configure AWS credentials",
					"uses": "aws-actions/configure-aws-credentials@v4",
					"with": {
						"aws-access-key-id": "${{ secrets.AWS_ACCESS_KEY_ID }}",
						"aws-secret-access-key": "${{ secrets.AWS_SECRET_ACCESS_KEY }}",
						"aws-region": "ap-northeast-2"
					}
				},
			]
		}
	}
}


var main = async () => {
	const services = ['erxes', 'core', 'gateway', 'crons', 'workers', 'essyncer', 'widgets', 'client-portal'];

	var plugins = [
		{ name: 'inbox', ui: true, api: true },
		{ name: 'automations', ui: true, api: true },
		{ name: 'calendar', ui: true },
		{ name: 'cards', ui: true, api: true },
		{ name: 'clientportal', ui: true, api: true },
		{ name: 'contacts', ui: true, api: true },
		{ name: 'emailtemplates', ui: true, api: true },
		{ name: 'engages', ui: true, api: true },
		{ name: 'forms', ui: true, api: true },
		{ name: 'integrations', api: true },
		{ name: 'internalnotes', api: true },
		{ name: 'knowledgebase', ui: true, api: true },
		{ name: 'logs', ui: true, api: true },
		{ name: 'loyalties', ui: true, api: true },
		{ name: 'notifications', ui: true, api: true },
		{ name: 'webhooks', ui: true, api: true },
		{ name: 'products', ui: true, api: true },
		{ name: 'segments', ui: true, api: true },
		{ name: 'tags', ui: true, api: true },
		{ name: 'webbuilder', ui: true, api: true },
		{ name: 'documents', ui: true, api: true },
		{ name: 'chats', ui: true, api: true },
		{ name: 'ebarimt', ui: true, api: true },
		{ name: 'exm', ui: true, api: true },
		{ name: 'exmfeed', ui: true, api: true },
		{ name: 'pos', ui: true, api: true },
		{ name: 'reactions', api: true },
		{ name: 'syncerkhet', ui: true, api: true },
		{ name: 'salesplans', ui: true, api: true },
		{ name: 'processes', ui: true, api: true },
		{ name: 'inventories', ui: true, api: true },
		{ name: 'posclient', api: true },
		{ name: 'imap', ui: true, api: true },
	];

	for (const plugin of plugins) {
		if (plugin.api) {
			services.push(`plugin-${plugin.name}-api`);
		}
	}

	for (const service of services) {
		let run = "echo ${{ secrets.DOCKERHUB_TOKEN }} | docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin \n"
			+ `docker image pull okrservice/${service}:dev \n`
			+ `docker tag okrservice/${service}:dev okrservice/${service}:\${GITHUB_REF#refs/tags/} \n`
			+ `docker push okrservice/${service}:\${GITHUB_REF#refs/tags/} \n`;

		if (service === 'erxes') {
			run += `aws s3 cp s3://okrservice-dev-plugins/locales.tar s3://okrservice-release-plugins/\${GITHUB_REF#refs/tags/}/locales.tar \n`;
		}

		releaseYaml.jobs.release.steps.push({
			name: `${service}`,
			run
		})
	}

	for (const plugin of plugins) {
		if (plugin.ui) {
			releaseYaml.jobs.release.steps.push({
				name: `${plugin.name} ui`,
				run: `aws s3 sync s3://okrservice-dev-plugins/uis/plugin-${plugin.name}-ui s3://okrservice-release-plugins/uis/plugin-${plugin.name}-ui/\${GITHUB_REF#refs/tags/}/`
			})
		}
	}

	const yamlString = yaml.stringify(releaseYaml);

	fs.writeFileSync(filePath('.github/workflows/release.yaml'), yamlString);
}

main();