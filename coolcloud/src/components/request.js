import React, { useState } from 'react';
import AWS from './aws-config';

const CloudFormationRequest = () => {
    const [stackName, setStackName] = useState('');
    const [status, setStatus] = useState('');

    const templateBody = JSON.stringify({
        AWSTemplateFormatVersion: "2010-09-09",
        Resources: {
            MyEC2Instance: {
                Type: "AWS::EC2::Instance",
                Properties: {
                    ImageId: "ami-0c55b159cbfafe1f0", 
                    InstanceType: "t2.micro"
                }
            },
            MyS3Bucket: {
                Type: "AWS::S3::Bucket",
                Properties: {
                    BucketName: "my-unique-bucket-name"
                }
            }
        }
    });

    const handleCreateStack = async () => {
        const cloudFormation = new AWS.CloudFormation();

        const params = {
            StackName: stackName,
            TemplateBody: templateBody,
            Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
        };

        try {
            const data = await cloudFormation.createStack(params).promise();
            setStatus(`Stack creation initiated. Stack ID: ${data.StackId}`);
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };



    return (
        <div className="flex flex-col items-center w-full justify-center min-h-screen">
            <h2 className="mb-8 text-3xl font-bold text-center">Create CloudFormation Stack</h2>
            <div className="w-full max-w-md">
                <input
                    type="text"
                    value={stackName}
                    onChange={(e) => setStackName(e.target.value)}
                    placeholder="Stack Name"
                    className="block w-full px-4 py-2 mb-4 border outline-none rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
                />

                <button
                    onClick={handleCreateStack}
                    className="w-full px-4 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
                >
                    Create Stack
                </button>
            </div>
            <p className="mt-6 text-center">{status}</p>
        </div>
    );
};

export default CloudFormationRequest;
