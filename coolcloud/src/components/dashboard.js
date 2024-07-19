import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GithubAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { Star, Flame, Cog, DollarSign, Users, ArrowLeft, Plus, Menu, User } from "lucide-react";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaGlobe, FaServer, FaCog, FaClock, FaGithub } from 'react-icons/fa';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Globe, Server, Package } from 'lucide-react';
import { Link } from "react-router-dom";
import Checkout from './checkout';
import PricingTable from "./pricing"
import { initializeApp } from "firebase/app";
import axios from "axios";
import GithubConnect from './githubConnect';

const firebaseConfig = {
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GithubAuthProvider();
provider.addScope('repo');

const Dashboard = ({ user, data, setPaid, initialOptions }) => {
  const [repositories, setRepositories] = useState([]);
  const [showList, setShowList] = useState(false);
  const [indRepo, setIndRepo] = useState(null);
  const [main, setMain] = useState(true);
  const [second, setSecond] = useState(false);
  const [forward, setForward] = useState(true);
  const [deploying, setDeploying] = useState(false);

  const [websiteSelected, setWebsiteSelected] = useState(false)
  const [webappSelected, setWebappSelected] = useState(false)

  const [formData, setFormData] = useState({
    webAppName: '',
    repoUrl: '',
    location: 'eastus',
    sku: 'F1',
    nodejsVersion: '18-lts'
  });

  const [deploymentStatus, setDeploymentStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [deployedUrl, setDeployedUrl] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [showTypes, setShowTypes] = useState(true)

  const signInWithGitHub = () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithPopup(auth, provider);
      })
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const newToken = credential.accessToken;
        setToken(newToken);
        console.log("Token: ", newToken)
        fetchRepositories(newToken);
        setShowList(true); 
        setShowTypes(false) 
      })
      .catch((error) => {
        console.error("Error during sign-in:", error.code, error.message);
      });
  };

  const fetchRepositories = async (accessToken, searchQuery = '', pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/user/repos?page=${pageNum}&per_page=50&q=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(response)
      if (pageNum === 1) {
        setRepositories(data);
      } else {
        setRepositories(prev => [...prev, ...data]);
      }

      setPage(pageNum);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchRepositories(token, searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, token]);

  const loadMore = () => {
    if (token) {
      fetchRepositories(token, searchTerm, page + 1);
    }
  };


  const goBack = () => {
    setShowList(true);
    setIndRepo(null);
    setMain(true);
    setForward(true);
  };

  const [activeSection, setActiveSection] = useState('main');

  const menuItems = [
    { icon: Flame, text: "Sites", onClick: () => setActiveSection('main') },
    { icon: Cog, text: "Integrations", onClick: () => setActiveSection('integrations') },
    { icon: DollarSign, text: "Billing", onClick: () => setActiveSection('billing') },
    { icon: Users, text: "Teams", onClick: () => setActiveSection('teams') },
    { icon: User, text: "Account", onClick: () => setActiveSection('user') }
  ];

  const stats = [
    { title: "Deployments", value: `${data?.length}` },
    { title: "Integrations", value: "0/1" },
    { title: "Cron jobs", value: "0" },
    { title: "Team members", value: "1" }
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDeploymentTypeSelect = (type) => {
    console.log('Selected deployment type:', type);
    signInWithGitHub();
  };

  const [selectedType, setSelectedType] = useState(null);

  const deploymentTypes = [
    { id: 'webservice', name: 'Web Service', icon: FaServer },
    { id: 'cron', name: 'Cron Job', icon: FaClock },
  ];

  const [deploymentType, setDeploymentType] = useState('static');

  const [staticFormData, setStaticFormData] = useState({
    webAppName: '',
    repoUrl: '',
  });

  const [webServiceFormData, setWebServiceFormData] = useState({
    token: token,
    webAppName: '',
    repoUrl: '',
    branch: 'main',
    runtime: 'node',
    startupCommand: '',
    location: 'us-east-1',
    nodejsVersion: '18.x'
  });

  const handleStaticFormChange = (e) => {
    setStaticFormData({ ...staticFormData, [e.target.name]: e.target.value });
  };

  const handleWebServiceFormChange = (e) => {
    setWebServiceFormData({ ...webServiceFormData, [e.target.name]: e.target.value });
  };

  const [successful, setSuccessfull] = useState(false)

  const deploymentsRef = collection(db, "deployments");

  const saveDeployment = async () => {
    try {
      const deploymentData = {
        uid: user.uid,
        url: `https://${staticFormData.webAppName}.azurewebsites.net`,
        data: deploymentType === 'static' ? staticFormData : webServiceFormData,
        successful: successful,
        timestamp: serverTimestamp(),
        deploymentType: deploymentType
      };

      const docRef = await addDoc(deploymentsRef, deploymentData);
      console.log("Deployment saved with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving deployment: ", error);
      throw error;
    }
  };

  const handleSubmitStatic = async (e) => {
    e.preventDefault();
    setDeploying(true);
    setDeploymentStatus('Deploying...');
    console.log("Static Site Data sent: ", staticFormData);
    try {
      const response = await axios.get('http://localhost:5000/deploy-website', { params: staticFormData });
      setDeploymentStatus(`Deployment successful. Deployment name: ${response.data.deployment_name}`);
      setDeployedUrl(`https://${staticFormData.webAppName}.azurewebsites.net`);
      setSuccessfull(true)
    } catch (error) {
      setDeploymentStatus(`Deployment failed: ${error.response?.data?.error || error.message}`);
      setDeployedUrl('');
      setSuccessfull(false)
    } finally {
      setDeploying(false);
      saveDeployment()
    }
  };

  const handleSubmitWebService = async (e) => {
    e.preventDefault();
    setDeploying(true);
    setDeploymentStatus('Deploying...');
    console.log("Web Service Data sent: ", webServiceFormData);
    try {
      const response = await axios.get('http://localhost:5000/deploy-webapp', { params: webServiceFormData });
      setDeploymentStatus(`Deployment successful`, response);
      console.log(response)
      setSuccessfull(true)
    } catch (error) {
      setDeploymentStatus(`Deployment failed: ${error.response?.data?.error || error.message}`);
      setDeployedUrl('');
      setSuccessfull(false)
    } finally {
      setDeploying(false);
      saveDeployment()
    }
  };

  const handleSelect = (type) => {
    setSelectedType(type);
    setDeploymentType(type);
    handleDeploymentTypeSelect(type);
  };

  const repoSelected = (repo) => {
    setShowList(false);
    setForward(false);
    setIndRepo(repo);
    const formData = {
      webAppName: repo.name,
      repoUrl: repo.html_url
    };
    setStaticFormData(prev => ({ ...prev, ...formData }));
    setWebServiceFormData(prev => ({ ...prev, ...formData }));
  };

  const [selectedDeployment, setSelectedDeployment] = useState(null);

  const handleDeploymentClick = (deployment) => {
    setSelectedDeployment(deployment);
    setActiveSection('deploymentDetails');
  };

  const [editMode, setEditMode] = useState(false);
  const [updatedDeployment, setUpdatedDeployment] = useState({ ...selectedDeployment });
  const [newDomain, setNewDomain] = useState('');
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });

  const renderDeploymentDetails = () => {
    if (!selectedDeployment) return null;

    const handleInputChange = (e) => {
      setUpdatedDeployment({
        ...updatedDeployment,
        data: { ...updatedDeployment.data, [e.target.name]: e.target.value }
      });
    };

    const handleSaveChanges = async () => {
      console.log('Saving changes:', updatedDeployment);
      setEditMode(false);
      setSelectedDeployment(updatedDeployment);
    };

    const handleAddDomain = () => {
      console.log('Adding new domain:', newDomain);
      setNewDomain('');
    };

    const handleAddEnvVar = () => {
      console.log('Adding new env var:', newEnvVar);
      setNewEnvVar({ key: '', value: '' });
    };

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Deployment Details: {selectedDeployment.data.webAppName}
          </h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">URL</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={selectedDeployment.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                  {selectedDeployment.url}
                </a>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Deployment Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedDeployment.deploymentType}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    name="location"
                    value={updatedDeployment?.data?.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="eastus">East US</option>
                    <option value="westus">West US</option>
                    <option value="centralus">Central US</option>
                  </select>
                ) : (
                  selectedDeployment?.data?.location
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">SKU/Pricing Tier</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    name="sku"
                    value={updatedDeployment?.data?.sku}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="F1">Free Tier (F1)</option>
                    <option value="B1">Basic (B1)</option>
                    <option value="S1">Standard (S1)</option>
                  </select>
                ) : (
                  selectedDeployment?.data?.sku
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Custom Domains</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {selectedDeployment?.customDomains && selectedDeployment?.customDomains?.map((domain, index) => (
                  <div key={index} className="mb-2">{domain}</div>
                ))}
                {editMode && (
                  <div className="mt-2 flex">
                    <input
                      type="text"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="Enter new domain"
                      className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={handleAddDomain}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Environment Variables</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {selectedDeployment?.envVars && Object?.entries(selectedDeployment?.envVars).map(([key, value], index) => (
                  <div key={index} className="mb-2">
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
                {editMode && (
                  <div className="mt-2 flex">
                    <input
                      type="text"
                      value={newEnvVar?.key}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                      placeholder="Key"
                      className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={newEnvVar?.value}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                      placeholder="Value"
                      className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={handleAddEnvVar}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </dd>
            </div>
          </dl>
        </div>
        {editMode && (
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={handleSaveChanges}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        )}
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-lg leading-6 font-medium text-gray-900">Deployment Logs</h4>
          <div className="mt-4 bg-gray-100 rounded-md p-4 overflow-auto max-h-60">
            <pre className="text-sm text-gray-700">
              {`Build started: ${new Date(selectedDeployment?.buildStartTime).toLocaleString()}
                Build completed: ${new Date(selectedDeployment?.buildEndTime).toLocaleString()}
                Deployment status: ${selectedDeployment?.status}
                Log entries:${selectedDeployment?.logs?.join('\n')}`}
            </pre>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      <header className="bg-white shadow-sm md:hidden">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center">
            CoolCloud
          </Link>
          <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </header>
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-lg`}>
        <div className="flex items-center justify-center h-16 border-b">
          <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center">
            CoolCloud
          </Link>
        </div>
        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <a
              key={index}
              onClick={item.onClick}
              className="flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
            >
              <item.icon className="mr-3" size={20} />
              {item.text}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm hidden md:block">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900"></h1>
            <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
              K
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeSection === 'main' && (
            <>
              <div className="py-6 flex items-center">
                <p className='text-xl font-semibold'>{user.displayName}</p>
                <button className='px-3 py-1 font-semibold rounded-lg text-sm bg-gray-200 ml-2'>Free tier</button>
              </div>
              {forward && (
                <>
                  <div className="mb-8">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {stats.map((item, index) => (
                        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                            <dd className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">{item.value}</dd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {showTypes && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {deploymentTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handleSelect(type.id)}
                            className={`flex items-center justify-center p-4 border rounded-lg ${selectedType === type.id
                              ? 'bg-indigo-100 border-indigo-500'
                              : 'border-gray-300 hover:border-indigo-500'
                              }`}
                          >
                            <type.icon className="mr-2 text-indigo-600" size={20} />
                            <span>{type.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Websites</h2>
                        <div className="grid grid-cols-1 gap-6">
                          {data.map((element, index) => (
                            <div key={index} onClick={() => handleDeploymentClick(element)} className="bg-white cursor-pointer overflow-hidden shadow rounded-lg">
                              <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 truncate mb-2">
                                  {element?.data?.webAppName}
                                </h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                  <div className="sm:col-span-1 flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-1">
                                      <Globe className="mr-2 h-5 w-5 text-indigo-500" />
                                      Location
                                    </dt>
                                    <dd className="text-sm ml-2 text-gray-900 bg-indigo-50 rounded-md px-2 py-1 inline-block">
                                      {element?.data?.location}
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-1 flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-1">
                                      <Server className="mr-2 h-5 w-5 text-indigo-500" />
                                      Type
                                    </dt>
                                    <dd className="text-sm ml-2 text-gray-900 bg-indigo-50 rounded-md px-2 py-1 inline-block">
                                      {element?.deploymentType}
                                    </dd>
                                  </div>
                                  <div className="sm:col-span-1 flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-1">
                                      <Package className="mr-2 h-5 w-5 text-indigo-500" />
                                      Tier
                                    </dt>
                                    <dd className="text-sm ml-2 text-gray-900 bg-indigo-50 rounded-md px-2 py-1 inline-block">
                                      {element?.data?.sku}
                                    </dd>
                                  </div>
                                </dl>
                                <div className="mt-6 space-y-2">
                                  <a href={element?.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                                    <Globe className="mr-2 h-4 w-4" />
                                    View Website
                                  </a>
                                  <a href={element?.data?.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                                    <FaGithub className="mr-2 h-4 w-4" />
                                    GitHub Repository
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              {showList && <GithubConnect searchTerm={searchTerm} setSearchTerm={setSearchTerm} setForward={setForward} repoSelected={repoSelected} repos={repositories} />}
              {indRepo && (
                <div className="mt-8">
                  <button onClick={goBack} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
                    <ArrowLeft className="mr-2" size={20} />
                    <span className="font-semibold">Go back</span>
                  </button>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Deploy your project</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Review configuration for {indRepo.name}
                      </p>
                      {deployedUrl && (
                        <p className="mt-2">
                          Your website is now available at: <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline">{deployedUrl}</a>
                        </p>
                      )}
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                      {deploymentType === 'static' ? (
                        <form onSubmit={handleSubmitStatic}>
                          <dl className="sm:divide-y sm:divide-gray-200">
                            {[
                              { label: "Web App Name", name: "webAppName", type: "text" },
                              { label: "Repository URL", name: "repoUrl", type: "text", disabled: true },
                              { label: "Location", name: "location", type: "select", options: ["eastus", "westus", "centralus"] },
                              { label: "SKU", name: "sku", type: "select", options: ["F1", "B1", "S1"] },
                              { label: "NodeJS version", name: "nodejsVersion", type: "select", options: ["18-lts", "20-lts"] },
                            ].map((field, index) => (
                              <div key={index} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {field.type === "select" ? (
                                    <select
                                      name={field.name}
                                      value={staticFormData[field.name]}
                                      onChange={handleStaticFormChange}
                                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                      {field.options.map((option, optionIndex) => (
                                        <option key={optionIndex} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      name={field.name}
                                      value={staticFormData[field.name]}
                                      onChange={handleStaticFormChange}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                      required
                                      disabled={field.disabled}
                                    />
                                  )}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                              type="submit"
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              disabled={deploying}
                            >
                              {deploying ? 'Deploying...' : `Deploy ${indRepo.name} as Static Site`}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleSubmitWebService}>
                          <dl className="sm:divide-y sm:divide-gray-200">
                            {[
                              { label: "Web App Name", name: "webAppName", type: "text" },
                              { label: "Repository URL", name: "repoUrl", type: "text", disabled: true },
                              { label: "Branch", name: "branch", type: "text" },
                              { label: "Runtime", name: "runtime", type: "select", options: ["node", "python"] },
                              { label: "Startup Command", name: "startupCommand", type: "text" },
                              { label: "Location", name: "location", type: "select", options: ["east-us-1", "us-east-2", "us-west-1"] },
                              { label: "NodeJS version", name: "nodejsVersion", type: "select", options: ["18.x", "22.x", "20.x", "16.x", "14.x"] },
                            ].map((field, index) => (
                              <div key={index} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-lg font-medium text-gray-800">{field.label}</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {field.type === "select" ? (
                                    <select
                                      name={field.name}
                                      value={webServiceFormData[field.name]}
                                      onChange={handleWebServiceFormChange}
                                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                      {field.options.map((option, optionIndex) => (
                                        <option key={optionIndex} value={option}>{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      name={field.name}
                                      value={webServiceFormData[field.name]}
                                      onChange={handleWebServiceFormChange}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                      required
                                      disabled={field.disabled}
                                    />
                                  )}
                                </dd>
                              </div>
                            ))}
                          </dl>
                            <PricingTable />
                          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                              type="submit"
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              disabled={deploying}
                            >
                              {deploying ? 'Deploying...' : `Deploy ${indRepo.name} as Web Service`}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                  {deploymentStatus && (
                    <div className="mt-6 mb-24">
                      <div className={`rounded-md ${deploymentStatus.includes('successful') ? 'bg-green-50' : 'bg-yellow-50'} p-4`}>
                        <div className="flex">
                          <div className="flex-shrink-0">
                            {deploymentStatus.includes('successful') ? (
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className={`text-sm font-medium ${deploymentStatus.includes('successful') ? 'text-green-800' : 'text-yellow-800'}`}>
                              Deployment Status
                            </h3>
                            <div className={`mt-2 text-sm ${deploymentStatus.includes('successful') ? 'text-green-700' : 'text-yellow-700'}`}>
                              <p>{deploymentStatus}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {activeSection === 'deploymentDetails' && renderDeploymentDetails()}
          {activeSection === 'integrations' && <Integrations/>}
          {activeSection === 'billing' && <Billing setPaid={setPaid} initialOptions={initialOptions} />}
          {activeSection === 'teams' && <Teams />}
          {activeSection === 'user' && <AccountSettings />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

const Billing = ({ setPaid, initialOptions }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Billing</h2>
      <div className='grid grid-cols-2 bg-white shadow overflow-hidden sm:rounded-lg'>
        <div className="">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Billing Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about your current plan and usage.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <p className='mr-2'>Free Tier</p> 
                <button className='text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'>Upgrade</button> </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">N/A</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Not set</dd>
              </div>
            </dl>
          </div>
        </div>
<div className=''>
          <PayPalScriptProvider className="sm:w-full" options={initialOptions}>
            <Checkout classNamew=" 2xl:w-full" setPaid={setPaid} />
          </PayPalScriptProvider>
</div>
</div>
    </div>
  );
};

const Teams = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Teams</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Team</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your team members here.</p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-500">john@example.com</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Owner</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Integrations = () => {
  const [awsAccountId, setAwsAccountId] = useState('');
  const [region, setRegion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-cf-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awsAccountId, region }),
      });

      if (!response.ok) throw new Error('Failed to generate CloudFormation template');

      const { cfnConsoleUrl } = await response.json();
      window.open(cfnConsoleUrl, '_blank');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AWS Integration</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">AWS Account Setup</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Enter your AWS Account ID to set up the integration.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="awsAccountId" className="block text-sm font-medium text-gray-700">
                  AWS Account ID
                </label>
                <input
                  type="text"
                  name="awsAccountId"
                  id="awsAccountId"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. 123456789012"
                  value={awsAccountId}
                  onChange={(e) => setAwsAccountId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  AWS Region
                </label>
                <input
                  type="text"
                  name="region"
                  id="region"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. us-west-2"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Set Up Integration'}
                </button>
              </div>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};


const AccountSettings = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account information here.</p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">Contact Email</div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-2">konlaptechs@gmail.com</div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">GitHub Login</div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-2">hectordiazgomez</div>
                  <button className="text-red-600 hover:text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">Full Name</div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-2">Hector Diaz</div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};



