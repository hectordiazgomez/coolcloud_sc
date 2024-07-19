


import React, { useState } from 'react';
import { FaAws, FaCheck, FaQuestionCircle } from 'react-icons/fa';
import { VscSparkleFilled } from "react-icons/vsc";
import { IoPerson } from 'react-icons/io5';
import { SiGooglecloud } from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import AWS from 'aws-sdk';

const CloudProviderSelector = () => {
    const [step, setStep] = useState(0);
    const [roleName, setRoleName] = useState('');
    const [provider, setProvider] = useState('');
    const [completedSteps, setCompletedSteps] = useState([]);
    const [accountId, setAccountId] = useState('');

    const handleCreateRole = async () => {
        try {
            AWS.config.update({
                region: "",
                accessKeyId: "",
                secretAccessKey: ""
            });
            const iam = new AWS.IAM();

            const trustPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'cloudformation.amazonaws.com',
                        },
                        Action: 'sts:AssumeRole',
                    },
                ],
            };
            const params = {
                RoleName: roleName,
                AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
            };

            const response = await iam.createRole(params).promise();
            console.log('Role created:', response.Role);
        } catch (error) {
            console.error('Error creating role:', error);
        }
    };

    const handleProviderClick = (provider) => {
        setProvider(provider);
        setStep(1);
    };

    const handleContinue = () => {
        setCompletedSteps([...completedSteps, step]);
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div className='flex pt-6'>
                            <div className='w-12'></div>
                            <a href='https://aws.amazon.com/marketplace/management/signin' target='_blank' rel='noopener noreferrer'>
                                <button className="mt-2 px-4 py-2 text-sm font-semibold border border-yellow-600 items-center text-yellow-500 rounded-lg transition duration-200 ease-in-out flex items-center justify-center">
                                    Log in <FaAws className="ml-2 text-2xl" />
                                </button>
                            </a>
                        </div>
                        <div className="pt-10 flex pl-12">
                            <button className="px-4 text-sm py-2 border border-blue-800 hover:bg-blue-100 text-blue-800 rounded-lg transition duration-200 ease-in-out" onClick={handleContinue}>Continue</button>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className='pl-12 '>
                            <p className='text-sm text-gray-800'>Make sure this is the ID of the account you are currently logged into and would like to provision resources in.</p>
                            <div className='flex items-center pt-6'>
                                <IoPerson className='w-3 h-auto text-purple-800' />
                                <p className='text-gray-600 text-sm px-3'>AWS account ID</p>
                                <FaQuestionCircle className='w-3 h-auto text-purple-800 cursor-pointer' />
                            </div>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="ex: 915037676314"
                                className="ml-12 text-sm px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                            />
                        </div>
                        <div className="mt-4 px-12 w-1/2 pt-6 flex justify-between">
                            <button
                                className="px-4 text-sm py-2 text-red-500 border border-red-500 hover:bg-red-100 rounded-lg transition duration-200 ease-in-out"
                                onClick={handleBack}
                            >
                                Back
                            </button>
                            <button
                                className="px-4 text-sm py-2 hover:bg-blue-100 text-blue-800 border border-blue-800 rounded-lg transition duration-200 ease-in-out"
                                onClick={handleContinue}
                                disabled={accountId.length !== 12 || !/^\d+$/.test(accountId)}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                );
            case 3:
                return (
                    <div className='pl-12'>
                        <div>
                            <p className='text-sm text-gray-800'>This grants Chillfy permissions to create infrastructure in your account.</p>
                            <p className='text-sm pt-1 text-gray-800'>Clicking the button below will take you to the AWS CloudFormation console. Return to Porter after clicking 'Create stack' in the bottom right corner.</p>
                        </div>
                        <div>
                            <p className='text-sm text-gray-800 pb-1 pt-6 font-semibold'>Add a Stack Name</p>
                        </div>
                        <div className="pr-12 w-full flex justify-between">
                            <input
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Role Name"
                                className="w-1/2 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className='flex pt-6'>
                            <a className='flex items-center' rel='noopener noreferrer'>
                                <FaAws className="mr-2 text-yellow-600 text-2xl" />
                                <button onClick={handleCreateRole} className="mt-2 px-4 py-2 text-sm font-semibold border border-yellow-600 items-center text-yellow-500 rounded-lg transition duration-200 ease-in-out flex items-center justify-center">
                                    Grant permissions
                                </button>
                            </a>
                        </div>
                        <div className="mt-4 pr-12 w-1/2 pt-6 flex justify-between">
                            <button className="px-4 text-sm py-2 text-red-500 border border-red-500 hover:bg-red-100 rounded-lg transition duration-200 ease-in-out" onClick={handleBack}>Back</button>
                            <button className="px-4 text-sm py-2 hover:bg-blue-100 text-blue-800 border border-blue-800 rounded-lg transition duration-200 ease-in-out" onClick={handleContinue}>Continue</button>
                        </div>
                    </div>

                );
            case 4:
                return (
                    <>
                        <div className="mt-4 w-1/2 px-12 pt-6 flex justify-between">
                            <button className="px-4 text-sm py-2 text-red-500 border border-red-500 hover:bg-red-100 rounded-lg transition duration-200 ease-in-out" onClick={handleBack}>Back</button>
                            <button className="px-4 text-sm py-2 hover:bg-blue-100 text-blue-800 border border-blue-800 rounded-lg transition duration-200 ease-in-out" onClick={handleContinue}>Continue</button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full flex-col pb-32 px-12 min-h-screen">
            {step === 0 && (
                <div className='w-full pt-32'>
                    <div className='flex pb-6'>
                        <VscSparkleFilled className='w-6 h-auto text-purple-500 mr-2' />
                        <p className='text-lg'>Select your provider</p>
                    </div>
                    <h2 className="text-gray-800 text-blue-600 mb-4">Select your existing cloud provider to get started with Chillfy:</h2>
                    <div className='flex justify-center'>
                        <div className="w-full pt-12 grid grid-cols-3">
                            <div className='px-12'>
                                <button onClick={() => handleProviderClick('aws')} className="flex w-full hover:bg-yellow-100 flex-col items-center py-4 rounded-lg border border-gray-700">
                                    <FaAws className="text-6xl text-yellow-500" />
                                    <span className="mt-2 text-gray-800">AWS</span>
                                </button>
                            </div>
                            <div className='px-12'>
                                <button onClick={() => handleProviderClick('azure')} className="flex w-full hover:bg-blue-100 flex-col items-center p-4 rounded-lg border border-gray-700">
                                    <VscAzure className="text-6xl text-blue-600" />
                                    <span className="mt-2 text-gray-800">Azure</span>
                                </button>
                            </div>
                            <div className='px-12'>
                                <button onClick={() => handleProviderClick('gcp')} className="flex w-full hover:bg-red-100 flex-col items-center p-4 rounded-lg border border-gray-700">
                                    <SiGooglecloud className="text-6xl text-red-600" />
                                    <span className="mt-2 text-gray-800">GCP</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {provider === 'aws' && step > 0 && (
                <div className="pt-16 w-2/3">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Grant AWS Permissions</h2>
                    <div className='flex py-4 items-center'>
                        <div className={`w-4 flex items-center h-4 rounded-full ${completedSteps.includes(1) ? 'bg-green-500' : 'bg-gray-300'} flex justify-center items-center mr-2`}>
                            {completedSteps.includes(1) && <FaCheck className="w-3 h-auto text-white" />}
                        </div>
                        <h3 className="text-gray-800 pl-6 font-medium">1. Log in to your AWS account</h3>
                    </div>
                    <div className='flex py-4 items-center'>
                        <div className={`w-4 h-4 rounded-full ${completedSteps.includes(2) ? 'bg-green-500' : 'bg-gray-300'} flex justify-center items-center mr-2`}>
                            {completedSteps.includes(2) && <FaCheck className="text-white w-3 h-auto " />}
                        </div>
                        <div>
                            <h3 className="pl-6 text-gray-800 font-medium">2. Enter your AWS account ID</h3>
                        </div>
                    </div>
                    <div className='flex py-4 items-center'>
                        <div className={`w-4 h-4 rounded-full ${completedSteps.includes(3) ? 'bg-green-500' : 'bg-gray-300'} flex justify-center items-center mr-2`}>
                            {completedSteps.includes(3) && <FaCheck className="text-white w-3 h-auto " />}
                        </div>
                        <h3 className="text-gray-800 pl-6 font-medium">3. Create an AWS CloudFormation stack</h3>
                    </div>
                    <li className="flex py-4 items-center">
                        <div className={`w-4 h-4 rounded-full ${completedSteps.includes(4) ? 'bg-green-500' : 'bg-gray-300'} flex justify-center items-center mr-2`}>
                            {completedSteps.includes(4) && <FaCheck className="text-white w-3 h-auto " />}
                        </div>
                        <h3 className="pl-6 text-gray-800 font-medium">4. Check permissions</h3>
                    </li>
                </div>
            )}
            {provider === 'aws' && step > 0 && (
                <div className="pt-8 w-2/3">
                    {renderStepContent()}
                </div>
            )}
        </div>
    );
};

export default CloudProviderSelector;
