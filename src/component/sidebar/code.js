import React from 'react';
import { ListGroup, 
    ListGroupItem, 
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label
} from 'reactstrap'
import {FaPlus, FaEdit} from 'react-icons/fa'
import ReactJSONEditor from '../reactJsonEditor'
import AceEditor from 'react-ace'
import Layout from './layout'
import 'brace/mode/jsx'
import 'brace/theme/github'
import { LayoutManager } from '../../manager/layout.manager';
import { ElementManager } from '../../manager/element.manager';
import { DataManager } from '../../manager/data.manager';

export default class SidebarCode extends React.Component {
    state = {
        modal: false,
        id:-1,
        code: '',
        name:'',
        import: '',
        property: {},
        group: '',
        selectedGroup: ''
    }

    layoutManger;
    elementManger;
    dataManager;

    componentWillMount() {
        this.layoutManger = LayoutManager.getInstance(LayoutManager);
        this.elementManger = ElementManager.getInstance(ElementManager);
        this.dataManager = DataManager.getInstance(DataManager);
    }

    toggle = (e, item)=> {
        const obj = { modal:!this.state.modal };
        if (e && e.target.name === 'add') {
            obj.id = -1;
            obj.name = '';
            obj.code = '';
            obj.import = '';
            obj.property = {};
            obj.group = '';
        } else if (item) {
            obj.id = item.id;
            obj.name = item.name;
            obj.code = item.code;
            obj.import = item.import;
            obj.property = item.property;
            obj.group = item.group;
            e.stopPropagation();
        }
        this.setState(obj);
    }

    save = () => {
        if (this.state.id === -1) {
            this.elementManger.create(this.state)
        } else {
            this.elementManger.update(this.state)
        }
        this.toggle();
    }

    delete = () => {
        this.elementManger.delete(this.state.id);
        this.toggle();
    }

    render() {
        this.props.elements.sort((a,b)=>a.name > b.name?1:-1);
        const groups = [];
        this.props.elements.forEach(item=> {
            let exist = false;
            groups.forEach(g=> {
                if (g.name === item.group) {
                    exist = true;
                }
            });
            if (!exist) {
                groups.push({name:item.group, type:item.type});
            }
        });
        return <div>
            <Layout layout={this.props.layout} selected={this.props.selected} tab={'code'}/>
            <h5>Element</h5>
            <div style={styles.listView}>
                {groups.filter((item)=> {
                    return this.dataManager.projectType === item.type;
                }).map(item=> {
                    return <ListGroup key={item.name}>
                        <ListGroupItem color={item.name===this.state.selectedGroup?'primary':'secondary'} style={{cursor:'pointer'}} onClick={()=>{
                            this.setState({selectedGroup: item.name})
                        }}> {item.name}</ListGroupItem>
                        {
                            this.state.selectedGroup === item.name && this.props.elements.filter(item=> {
                                return item.group === this.state.selectedGroup
                            }).map(item=> {
                                return <ListGroupItem action key={item.name} style={{cursor:'pointer'}} onClick={()=>{
                                        this.layoutManger.create(item);
                                    }}>
                                    {item.name}
                                    <FaEdit style={styles.editIcon} onClick={(e)=> this.toggle(e, item)}/>
                                </ListGroupItem>
                            })
                        }
                    </ListGroup>
                })}
                    
                <Button color="success" style={styles.listItem} onClick={this.toggle} name='add'><FaPlus />Element</Button>
            </div>
            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>Add Element</ModalHeader>
                <ModalBody>
                    <Label>Group</Label>
                    <Input type="text" onChange={(e)=>this.setState({group:e.target.value})} value={this.state.group} />
                    <Label>Name</Label>
                    <Input type="text" onChange={(e)=>this.setState({name:e.target.value})} value={this.state.name} />
                    <Label>import</Label>
                    {this.importbox()}
                    <Label>Code</Label>
                    {this.sandbox()}
                    <Label>Property</Label>
                    {this.setProperty()}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.save}>Save</Button>{' '}
                    <Button color="danger" onClick={this.delete}>Delete</Button>{' '}
                    <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    }

    importbox() {
        return <AceEditor 
            style={{width:'100%', height:45}}
            theme="github" 
            mode="jsx" 
            value={this.state.import}
            onChange={(value)=> this.setState({import:value})}
            editorProps={{
            $blockScrolling: false,
            }} />
    }

    sandbox() {
        return <AceEditor 
            style={{width:'100%', height:200}}
            theme="github" 
            mode="jsx" 
            value={this.state.code}
            onChange={(value)=> this.setState({code:value})}
            editorProps={{
              $blockScrolling: false,
            }} />
    }

    setProperty() {
        return <ReactJSONEditor values={this.state.property} onChange={(values)=>this.setState({property:values})}/>
    }
}

const styles = {
    listView: {
        padding:5
    },
    listItem: {
        marginTop:5,
        width:'100%'
    },
    editIcon:{
        fontSize:20,
        float:'right',
        cursor:'pointer'
    },
    propertyKey: {
        width:'40%',
        display:'inline-block'
    },
    propertyValue: {
        width:'60%',
        display:'inline-block'
    }
}