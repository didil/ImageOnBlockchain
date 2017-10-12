import React, {Component} from 'react'
import CredentialsStoreContract from '../build/contracts/CredentialsStore.json'
import getWeb3 from './utils/getWeb3'

const contract = require('truffle-contract')

var NotificationSystem = require('react-notification-system');
var Loader = require('react-loader');

import SubmitForm from './components/SubmitForm';

const IPFS = require('ipfs-mini');

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      submitFormDisplayed: true,
      fetchFormDisplayed: false,
      recentSubmissions: []
    }
  }


  addNotification(message, level) {
    this._notificationSystem.addNotification({
      message: message,
      level: level,
      position: "br"
    });
  }

  componentWillMount() {
    this.setupWeb3((err) => {
      if (err) {
        return console.log(err);
      }
      this.instantiateContract();
    });
    this.setupIpfs();
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  setupWeb3(cb) {
    this.setState({loadingWeb3: true,});
    getWeb3.then(results => {
      let web3 = results.web3;
      if (!web3) {
        return this.setState({
          loadingWeb3: false,
          network: "Unknown",
          web3: null
        });
      }

      let networkName;
      web3.version.getNetwork((err, networkId) => {
        switch (networkId) {
          case "1":
            networkName = "Main";
            break;
          case "2":
            networkName = "Morden";
            break;
          case "3":
            networkName = "Ropsten";
            break;
          case "4":
            networkName = "Rinkeby";
            break;
          case "42":
            networkName = "Kovan";
            break;
          default:
            networkName = "Unknown";
        }

        this.setState({
          loadingWeb3: false,
          web3: web3,
          networkName: networkName
        });
        cb();
      });
    }).catch((err) => {
      this.setState({loadingWeb3: false});
      console.log('Error finding web3.',err.message);
    });
  }

  setupIpfs() {
    const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
    this.setState({ipfs: ipfs});
  }

  instantiateContract() {
    const credentialsStoreContract = contract(CredentialsStoreContract);
    credentialsStoreContract.setProvider(this.state.web3.currentProvider);

    credentialsStoreContract.deployed().then((credentialsStoreContractInstance) => {
      this.setState({credentialsStoreContractInstance});
    }).catch((err) => {
      this.addNotification(err.message, "error");
    });
  }

  showSubmitForm() {
    this.setState({submitFormDisplayed: true});
    this.setState({fetchFormDisplayed: false});
  }

  showFetchForm() {
    this.setState({fetchFormDisplayed: true});
    this.setState({submitFormDisplayed: false});
  }

  onSubmit() {
    this.setState({submitFormDisplayed: false});
  }

  render() {
    let noNetworkError = <h3 className="no-network">You're not connected to an Ethereum network. Please install <a
        href="https://metamask.io/">MetaMask</a> or Mist</h3>;

    return (
      <div className="App">
        <NotificationSystem ref="notificationSystem"/>

        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">ImageOnBlockchain</a>
          <a href="#" className="pure-menu-item pure-menu-link">
            Current Network:
            <span
              className={`network-name ${!this.state.loadingWeb3 && this.state.web3 ? 'green' : ''} ${!this.state.loadingWeb3 && !this.state.web3 ? 'red' : ''}`}>
              {this.state.networkName}
              </span>
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-3-24"></div>
            <div className="pure-u-18-24">
              <h1>ImageOnBlockchain</h1>
              <Loader loaded={!this.state.loadingWeb3}>
                {this.state.web3 ?

                  <div>
                    <div className="pure-u-1-1">
                      <button className="pure-button pure-button-primary" onClick={() => this.showSubmitForm()}>
                        Submit Credential
                      </button>
                      <button className="pure-button pure-button-primary"
                              onClick={() => this.showFetchForm()}>
                        Query Credentials
                      </button>

                      {this.state.submitFormDisplayed ?
                        <SubmitForm web3={this.state.web3} ipfs={this.state.ipfs}
                                    credentialsStoreContractInstance={this.state.credentialsStoreContractInstance}
                                    addNotification={this.addNotification.bind(this)}
                                    onSubmit={this.onSubmit.bind(this)}/>
                        : null}

                    </div>
                  </div>
                  :
                  noNetworkError
                }
              </Loader>


            </div>
            <div className="pure-u-3-24"></div>
          </div>


          <div className="pure-g footer-grid">
            <div className="pure-u-3-24"></div>
            <div className="pure-u-18-24">
            </div>
            <div className="pure-u-3-24"></div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
