import React from 'react';
import { Input, Button, Tooltip } from 'reactstrap';
import { AssetManager } from './../../manager/asset.manager';

export class SidebarAsset extends React.Component {

    state = {
        name: '',
        open: '',
    }

    fileRef;

    constructor() {
        super();
        this.fileRef = React.createRef();
    }

    assetManager;

    componentWillMount() {
        this.assetManager = AssetManager.getInstance(AssetManager);
    }

    fileSelect = (e) => {
        const FileReader = new window.FileReader();
        FileReader.onload = (e) => {
            if (this.state.name in this.assetManager.data) {
                this.assetManager.update(this.state.name, e.target.result);
            } else {
                this.assetManager.create(this.state.name, e.target.result);
            }
            this.setState({name:''});
        }
        FileReader.readAsDataURL(e.target.files[0]);
    }

    add = () => {
        if(this.state.name && this.state.name !== '') {
            this.fileRef.current.click();
        }
    }

    delete = () => {
        if(this.state.name && this.state.name !== '') {
            if (this.state.name in this.assetManager.data) {
                this.assetManager.delete(this.state.name);
                this.setState({name:''});
            }
        }
    }

    toogle = (asset) => {
        if (this.state.open === asset) {
            this.setState({open:''});
        } else {
            this.setState({open:asset});
        }
    }

    render() {
        return <div>
            <h5>Asset</h5>
            {Object.keys(this.assetManager.data).map(asset=> {
                return <div key={asset} style={{margin:10}}>
                    {asset} 
                    <img 
                        id={'asset-'+asset}
                        style={{width:30, height:30, float:'right'}} 
                        src={this.assetManager.data[asset]} />
                    <Tooltip placement="right" target={'asset-'+asset} isOpen={this.state.open === asset} toggle={()=>this.toogle(asset)}>
                        <img style={{width:150}} src={this.assetManager.data[asset]} />
                    </Tooltip>
                </div>
            })}
            <Input placeholder="name" value={this.state.name} onChange={(e)=>this.setState({name:e.target.value})}/>
            <input type="file" style={{display:'none'}} ref={this.fileRef} onChange={this.fileSelect}/>
            <Button 
                color="success" 
                style={{display:'inline-block', width:'50%'}}
                onClick={this.add}>Add</Button>
            <Button 
                color="danger" 
                style={{display:'inline-block', width:'50%'}}
                onClick={this.delete}>Delete</Button>
        </div>
    }
}