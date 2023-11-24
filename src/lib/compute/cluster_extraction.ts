import openai from 'openai';
import { open_ai_key } from './open_ai_key';

async function gpt(
	apiKey: string,
	systemPrompt: string,
	promptTemplate: string,
	replacements: { [key: string]: string },
	info,
	error,
	success
) {
	let prompt = promptTemplate;
	for (const [key, value] of Object.entries(replacements)) {
		prompt = prompt.replace(`{${key}}`, value);
	}
	const OpenAI = new openai({ apiKey, dangerouslyAllowBrowser: true });
	console.log('calling openai...');
	info('Calling OpenAI');
	const res = await OpenAI.chat.completions.create({
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: prompt }
		],
		model: 'gpt-4-1106-preview',
		response_format: { type: 'json_object' },
		temperature: 0.1
	});
	console.log('got result from openai...', res);
	return res.choices[0].message.content!;
}

export const cluster_extraction = async (node, inputData, info, error, success) => {
	if (!node.data.dirty) {
		console.log('Cluster data is not dirty. Returning.');
		return node.data.output;
	}
	console.log('Computing', node.data.label, 'with input data', inputData);
	info('Computing' + node.data.label);
	const csv = inputData.csv || inputData[node.data.input_ids.csv];
	const open_ai_key = inputData.open_ai_key || inputData[node.data.input_ids.open_ai_key];
	if (csv.length == 0) {
		node.data.dirty = false;
		return;
	}
	const { prompt, system_prompt } = node.data;
	const result = await gpt(
		open_ai_key,
		system_prompt,
		prompt,
		{
			comments: csv.map((x: any) => x['comment-body']).join('\n')
		},
		info,
		error,
		success
	);
	node.data.output = JSON.parse(result);
	node.data.dirty = false;
	success('Done computing ' + node.data.label);
	return node.data.output;
};
