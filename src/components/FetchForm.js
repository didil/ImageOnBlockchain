import React, {Component} from 'react'

var Loader = require('react-loader');
var _ = require('lodash');

let MAX_RESULTS = 10;

class FetchForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      credentials: [],
      loadingCredentials: false,
      statusFilter: ''
    };
  }

  componentWillMount() {
  }

  loadImageData(imageHash) {
    return new Promise((resolve, reject) => {
      this.props.ipfs.cat(imageHash, (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  loadCredential(credentialId) {
    return new Promise((resolve, reject) => {
      let credential = {};
      this.props.credentialsStoreContractInstance.find(credentialId).then((values) => {
        credential.credentialId = credentialId;
        credential.issuer = this.props.web3.toAscii(values[0]);
        credential.recipient = this.props.web3.toAscii(values[1]);
        credential.status = this.props.web3.toAscii(values[2]);
        credential.imageHash = this.props.web3.toAscii(values[3]);

        resolve(credential);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async loadCredentials() {
    this.setState({loadingCredentials: true, credentials: []});
    try {
      let status = this.state.statusFilter.trim().toLowerCase();
      let credentials = [];
      let credentialIds = [];
      let credentialsCount = await this.props.credentialsStoreContractInstance.getCredentialsByStatusCount(status);
      credentialsCount = credentialsCount.toNumber();

      let queryMax, queryMin;

      queryMax = credentialsCount - 1;
      queryMin = Math.max(0, queryMax - (MAX_RESULTS - 1));

      for (let i = queryMax; i >= queryMin; i--) {
        let credentialId = await await this.props.credentialsStoreContractInstance.getCredentialIdByStatus(status, i);
        credentialIds.push(credentialId.toNumber());
      }

      for (let i = 0; i < credentialIds.length; i++) {
        let credential = await this.loadCredential(credentialIds[i]);
        credentials.push(credential);
      }

      for (let i = 0; i < credentials.length; i++) {
        let credential = credentials[i];
        let imageData = await this.loadImageData(credential.imageHash);
        credential.imageData = imageData;
      }

      this.setState({loadingCredentials: false, credentials: credentials});
    }
    catch (err) {
      this.setState({loadingCredentials: false});
      this.props.addNotification(err.message, "error");
    }
  }

  validForm() {
    if (!this.props.credentialsStoreContractInstance) {
      return false;
    }

    return this.state.statusFilter.trim();
  }

  updateInputValue(e, field) {
    this.setState({[field]: e.target.value});
  }

  obfuscate(hash) {
    return hash.substring(0, 5) + "**********" + hash.substring(hash.length - 5, hash.length);
  }


  renderCredential(credential) {
    return (
      <div className="credential" key={credential.credentialId}>
        <div className="pure-g">
          <div className="pure-u-6-24">
            <label className="credential-field-label">Id:</label>
            <span className="credential-id">{credential.credentialId}</span>
          </div>
          <div className="pure-u-6-24">
            <label className="credential-field-label">Issuer:</label>
            <span className="credential-issuer">{credential.issuer}</span>
          </div>
          <div className="pure-u-6-24">
            <label className="credential-field-label">Recipient:</label>
            <span className="credential-recipient">{credential.recipient}</span>
          </div>
          <div className="pure-u-6-24">
            <label className="credential-field-label">Status:</label>
            <span className="credential-recipient">{credential.status}</span>
          </div>
          <div className="pure-u-5-5">
            {credential.imageData ?
              <div>
                <img className="credential-image" src={credential.imageData} role="presentation"/>
              </div>
              : <em>Loading image ...</em>}
          </div>
          <div className="pure-u-5-5">
            <label className="credential-field-label">IPFS Hash:</label>
            <span className="credential-image-hash">{this.obfuscate(credential.imageHash)}</span>
          </div>
        </div>
      </div>);
  }

  render() {
    return (
      <div className="FetchForm">
        <h4>Query Credentials:</h4>

        <form className="pure-form" onSubmit={(e) => event.preventDefault()}>
          <fieldset className="pure-group">
            <input type="text" className="pure-input-1-2" placeholder="Status"
                   value={this.state.statusFilter} onChange={e => this.updateInputValue(e, 'statusFilter')}/>
          </fieldset>

          <Loader loaded={!this.state.loadingCredentials}>
            <button type="button" className="pure-button pure-input-1-2 button-success"
                    disabled={!this.validForm() || this.state.loadingCredentials}
                    onClick={() => this.loadCredentials()}>Load Credentials
            </button>
          </Loader>
        </form>

        <div className="Credentials">
          {this.state.credentials.map((credential) => this.renderCredential(credential))}
        </div>

      </div>
    );
  }
}

export default FetchForm;
