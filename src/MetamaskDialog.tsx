import { useState, useEffect } from 'react';
import { useEventCloud } from './EventCloudContext';
import type { FighterAttributes } from 'interfaces/fighterAttributes.interface';
import Web3 from 'web3';

function MetamaskDialog() {
  const [fighterName, setFighterName] = useState<string>('');
  const { account, setAccount, userFighters, fetchUserFighters, createFighter, sendAuth } = useEventCloud(); 

  useEffect(() => {
    connectToMetamask();
  }, []);

  const connectToMetamask = async () => {
    // Check if Metamask is installed
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.enable();

        // After user grants account access, get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        fetchUserFighters(accounts[0])
      } catch (error) {
        console.error("Failed to enable Metamask");
      }
    } else {
      console.log("Please install Metamask!");
    }
  };

  const createWarrior = () => {
    createFighter(account, 1, fighterName)
  };

  const createWizard = () => {
    createFighter(account, 2, fighterName)
  };

  return (
    <div>
      {account ? `Connected with Metamask: ${account}` : 'Please connect to Metamask'}
      |||
      {userFighters?.map((userFighter, index) => (
        <button key={index} onClick={() => sendAuth(userFighter.TokenID)}>{userFighter.Name}</button>  // Added onClick here
      ))}
      |||
      <input 
        type="text" 
        placeholder="Enter Fighter Name" 
        value={fighterName} 
        onChange={(e) => setFighterName(e.target.value)} 
      />
      

      <button onClick={createWarrior}>Create Warrior</button>
      <button onClick={createWizard}>Create Wizard</button>
      
    </div>
  );
}

export default MetamaskDialog;
