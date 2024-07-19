import React from 'react';

const PricingTier = ({ name, price, ram, cpu }) => (
    <div className={`border m-4 rounded-lg cursor-pointer grid grid-cols-2 hover:border-purple-400 p-4 border-gray-300`}>
<div>
            <h2 className="text-lg font-medium text-gray-800">{name}</h2>
            <p className="text-gray-600 text-sm">${price} / month</p>
</div>
        <div className="mt-2 text-sm ">
            <p className="text-gray-700 text-end">{ram} (RAM) </p>
            <p className="text-gray-700 text-end">{cpu} CPU</p>
        </div>
    </div>
);

const PricingTable = () => {
    return (
<>
            <div className='sm:px-16 p-4 pt-8 pb-4'>
                <p className='text-lg font-medium text-gray-800'>Pricing table</p>
</div>
            <div className="bg-white mx-auto sm:px-16 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PricingTier name="Free" price={0} ram="512 MB" cpu="0.1 CPU" />
                    <PricingTier name="Starter" price={7} ram="512 MB" cpu="0.5 CPU" highlighted={true} />
                    <PricingTier name="Standard" price={25} ram="2 GB" cpu="1 CPU" />
                    <PricingTier name="Pro" price={85} ram="4 GB" cpu="2 CPU" />
                    <PricingTier name="Pro Plus" price={175} ram="8 GB" cpu="4 CPU" />
                    <PricingTier name="Pro Max" price={225} ram="16 GB" cpu="4 CPU" />
                    <PricingTier name="Pro Ultra" price={450} ram="32 GB" cpu="8 CPU" />
                </div>
            </div>
</>
    );
};

export default PricingTable;