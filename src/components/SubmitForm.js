import React, {Component} from 'react'

var Loader = require('react-loader');


class SubmitForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      credential: {},
      savingImage: false,
      savingCredential: false
    };
  }

  componentWillMount() {

  }

  saveCredential() {
    this.setState({savingCredential: true});
    let credential = this.state.credential;
    // save status lowercase to allow indexing
    let issuer = credential.issuer.trim();
    let recipient = credential.recipient.trim();
    let status = credential.status.trim().toLowerCase();
    let imageHash = credential.imageHash;

    this.props.credentialsStoreContractInstance.save(issuer, recipient, status, imageHash, {gas: 500000}).then((result) => {
      /* if(result.receipt.status !== "0x1"){ // can be used after byzantium to check status
         throw new Error("Transaction failed");
      } */

      this.setState({savingCredential: false});
      console.log('Data saved successfully, Tx:', result.tx);
      let log = result.logs[0];
      let credentialId = log.args._credentialId.toNumber();
      this.props.addNotification(`Data saved successfully ! Credential ID: ${credentialId}`, "success");
      this.setState({credential: {}});
      this.props.onSubmit(result.tx);
    }).catch((err) => {
      this.setState({savingCredential: false});
      this.props.addNotification(err.message, "error");
    });
  }

  updateInputValue(e, field) {
    let credential = this.state.credential;
    credential[field] = e.target.value;
    this.setState({credential});
  }

  captureImage(event) {
    event.stopPropagation();
    event.preventDefault();
    this.setState({savingImage: true});
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (fileLoadedEvent) =>  {
      this.saveImageToIpfs(fileLoadedEvent.target.result);
    };
    reader.readAsDataURL(file);
  }

  saveImageToIpfs(base64Data) {
    let credential = this.state.credential;
    credential.imageHash = null;
    this.setState({credential});

    this.props.ipfs.add(base64Data, (err, imageHash) => {
      if (err) {
        this.setState({savingImage: false});
        return this.props.addNotification(err.message, "error");
      }

      console.log("IPFS hash:", imageHash);

      let credential = this.state.credential;
      credential.imageHash = imageHash;
      this.setState({savingImage: false, credential});
    });
  }

  validForm() {
    if (!this.props.credentialsStoreContractInstance) {
      return false;
    }

    let credential = this.state.credential;
    return credential.issuer && credential.issuer.trim() &&
      credential.recipient && credential.recipient.trim() &&
      credential.status && credential.status.trim() && credential.imageHash;
  }

  render() {
    return (
      <div className="SubmitForm">

        <h4>Submit a Credential:</h4>

        <form className="pure-form" onSubmit={(e) => event.preventDefault()}>
          <fieldset className="pure-group">
            <input type="text" className="pure-input-1-2" placeholder="Issuer"
                   value={this.state.credential.issuer} onChange={e => this.updateInputValue(e, 'issuer')}/>
            <input type="text" className="pure-input-1-2" placeholder="Recipient"
                   value={this.state.credential.recipient} onChange={e => this.updateInputValue(e, 'recipient')}/>
            <input type="text" className="pure-input-1-2" placeholder="Status"
                   value={this.state.credential.status} onChange={e => this.updateInputValue(e, 'status')}/>
            <label>Choose file to upload</label>
            <input type="file" id="image" name="image" onChange={this.captureImage.bind(this)}/>
            {this.state.credential.imageHash ? <em>Image uploaded !</em> : null}
          </fieldset>


          <Loader loaded={!this.state.savingCredential && !this.state.savingImage}>
            <button type="button" className="pure-button pure-input-1-2 button-success"
                    disabled={!this.validForm() || this.state.savingImage || this.state.savingCredential}
                    onClick={() => this.saveCredential()}>Save
            </button>
          </Loader>
        </form>
      </div>
    );
  }
}

export default SubmitForm;
