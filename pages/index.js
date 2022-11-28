import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Web3Provider } from '@ethersproject/providers';
import { useState, useEffect, useRef } from 'react';
import Web3Modal from 'Web3modal';
import { useViewerConnection, useViewerRecord } from '@self.id/react';
import { EthereumAuthProvider } from '@self.id/web';


export default function Home() {
 //store a reference for web3Modal
  const web3ModalRef = useRef();

  const [connection, connect, disconnect] = useViewerConnection();

  // chech if the user is connected using a web3Provider ( eg metamask )
  // and prompt them to connect if not
  const getProvider = async () =>{
    // prompt usser to connect wallet if wallet not connected yet
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new Web3Provider(provider);
    return wrappedProvider;
  };

  // on page-load, we chech if the user is connected to ceramic network,
  // if not we initialize the web3Modal
  useEffect(()=>{
    if(connection.status !== 'connected'){
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  };

  // create an instance of the EthereumAuthProvder
  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();

    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  return (
    <div className={styles.main}>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic 
        Id App</span>
        {connection.status === 'connected' ? (<span className={styles.subtitle}>connected</span>) : (<button 
        onClick={connectToSelfID}
        className={styles.button}
        disabled = {connection.status === 'connecting'}
        >
          Connect
        </button>)}

        <div className={styles.content}>
          <div className={styles.connection}>
            {connection.status === 'connected' ? ( <div className={styles.subtitle}>
              <span>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div> ):(
              <span className={styles.subtitle}>Connect with your wallet to access your 3ID </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



function RecordSetter(){

  // a variable that helps use to set and update profile information
  const record = useViewerRecord('basicProfile');

  // state variable that helps us set 'record'
  const [name, setName] = useState('');

  const updateRecordName = async ( name ) => {
    await record.merge({
      name : name,
    });
  };

  return(
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}> Hello {record.content.name}!</span>
            <span>The above name was loaded from Ceramic, Try updating it below</span>
          </div>
        ):(
          <span>You do not have a profile record attached to your 3ID. Create a basic one by setting a name below</span>
        )}
      </div>
      <input type='text'
      placeholder = 'Name'
      value = {name}
      onChange={(e)=>setName(e.target.value)}
      className = {styles.mt2}/>
      <button onClick={()=> updateRecordName(name)}> Update </button>
    </div>
  );

}
