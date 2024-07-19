import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";


const firebaseConfig = {
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Checkout = ({ setPaid }) => {
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
    const [currency, setCurrency] = useState(options.currency);

    const onCurrencyChange = ({ target: { value } }) => {
        setCurrency(value);
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: value,
            },
        });
    }

    const onCreateOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: "15",
                    },
                },
            ],
        });
    }

    const onApproveOrder = (data, actions) => {
        return actions.order.capture().then(async (details) => {
            const name = details.payer.name.given_name;
            alert("You can now access all the services");
            setPaid(true);

            const db = getFirestore();
            const userRef = doc(db, 'paying_users', auth.currentUser.email);
            await setDoc(userRef, { paid: true }, { merge: true });
        });
    };

    return (
        <div className="py-20 2xl:w-1/3 flex justify-center">
            <div className='w-5/6 sm:w-full 2xl:w-5/6'>
                {isPending ? <p>Loading...</p> : (
                    <>
                        <select value={currency} onChange={onCurrencyChange}>
                            <option value="USD">💵 USD</option>
                            <option value="EUR">💶 Euro</option>
                        </select>
                        <PayPalButtons
                            style={{ layout: "vertical" }}
                            createOrder={(data, actions) => onCreateOrder(data, actions)}
                            onApprove={(data, actions) => onApproveOrder(data, actions)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default Checkout;