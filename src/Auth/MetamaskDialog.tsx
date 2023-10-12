import styles from './Auth.module.scss'

import React from 'react';
import Web3 from 'web3';

import { useAuth } from './useAuth';
import { useCloud } from 'EventCloud/useCloud';

function MetamaskDialog() {
	const [fighterName, setFighterName] = React.useState<string>('');
	const [readyState, account, setAccount, sendAuth, fetchUserFighters, createFighter, userFighters] = useCloud(state => [state.readyState ,state.account, state.setAccount, state.sendAuth, state.fetchUserFighters, state.createFighter, state.userFighters])
	const hide = useAuth(state => state.hide)

	React.useEffect(() => {
		if (readyState) {
			connectToMetamask()
		}
	}, [readyState])

	const connectToMetamask = React.useCallback(async () => {
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
	}, [setAccount, fetchUserFighters])

	const createWarrior = React.useCallback(() => {
		createFighter(account, "Warrior", fighterName)
	}, [createFighter])

	const createWizard = React.useCallback(() => {
		createFighter(account, "Wizard", fighterName)
	}, [createFighter])

	if (!account) {
		return (
			<div className={styles.MetamaskDialog}>
				<h4>Please connect to Metamask</h4>
			</div>
		)
	}

	return (
		<div className={styles.MetamaskDialog}>
			<h4>Connected with Metamask: {account}</h4>
			<div className={styles.MetamaskDialogRow}>
				<p>Your Characters:</p>
				<div>
					{userFighters?.map((userFighter, index) => (
						<button key={index} onClick={() => {sendAuth(userFighter.TokenID); hide()}}>{userFighter.Name}</button>  // Added onClick here
					))}
				</div>
			</div>

			<div className={styles.MetamaskDialogRow}>
				<p>Create new Character:</p>
				<input
					type="text"
					placeholder="Enter Fighter Name"
					value={fighterName}
					onChange={(e) => setFighterName(e.target.value)}
				/>

				<button onClick={createWarrior}>Create Warrior</button>
				<button onClick={createWizard}>Create Wizard</button>
			</div>

		</div>
	);
}

export default MetamaskDialog;
