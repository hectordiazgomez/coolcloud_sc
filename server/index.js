import express from 'express';
import AWS from 'aws-sdk';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: ''
});

const cloudFormation = new AWS.CloudFormation();

app.get('/deploy-webapp', async (req, res) => {
    const {
        webAppName,
        repoUrl,
        branch,
        startupCommand,
        location,
        token,
        nodejsVersion
    } = req.query;

    let templateBody = fs.readFileSync('./template.yaml', 'utf8');
    templateBody = templateBody.replace('{{STARTUP_COMMAND}}', startupCommand);
    templateBody = templateBody.replace('{{LOCATION}}', location);
    templateBody = templateBody.replace('{{TOKEN}}', token);
    templateBody = templateBody.replace('{{NODEJS_VERSION}}', nodejsVersion);

    const gitLink = repoUrl.replace('https://', '');

    const params = {
        StackName: webAppName,
        TemplateBody: templateBody,
        Parameters: [
            {
                ParameterKey: 'GitRepository',
                ParameterValue: gitLink
            },
            {
                ParameterKey: 'GitBranch',
                ParameterValue: branch
            },
            {
                ParameterKey: 'InstanceType',
                ParameterValue: 't2.micro'
            },
            {
                ParameterKey: 'KeyName',
                ParameterValue: 'morat'
            }
        ],
        Capabilities: ['CAPABILITY_IAM']
    };

    try {
        await cloudFormation.describeStacks({ StackName: params.StackName }).promise();
        console.log("Stack exists, updating it.");
        await cloudFormation.updateStack(params).promise();
        const result = await waitForStackCompletion(params.StackName, 'UPDATE');
        res.json(result);
    } catch (err) {
        if (err.code === 'ValidationError') {
            console.log("Stack doesnt exist. Creating new stack");
            await cloudFormation.createStack(params).promise();
            const result = await waitForStackCompletion(params.StackName, 'CREATE');
            res.json(result);
        } else {
            console.error("Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
});

async function waitForStackCompletion(stackName, operation) {
    const waiter = operation === 'CREATE' ? 'stackCreateComplete' : 'stackUpdateComplete';

    try {
        await cloudFormation.waitFor(waiter, { StackName: stackName }).promise();
        const { Stacks } = await cloudFormation.describeStacks({ StackName: stackName }).promise();
        const stack = Stacks[0];
        console.log(stack.Outputs)
        return {
            message: `Stack ${operation.toLowerCase()} completed successfully`,
            stackStatus: stack.StackStatus,
            outputs: stack.Outputs
        };
    } catch (error) {
        console.error(`Error waiting for stack ${operation.toLowerCase()} to complete:`, error);
        return {
            message: `Stack ${operation.toLowerCase()} failed`,
            error: error.message
        };
    }
}

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));