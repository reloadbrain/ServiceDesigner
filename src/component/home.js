import React from 'react';
import PubsubService from './../service/pubsub.service'
import CodeSandbox from 'react-code-sandbox'
import ReactStrapService from '../service/reactstrap.service'
import DataService from '../service/data.service'

export default class Home extends React.Component {

    state = {
        page: '',
        selected: null,
        imports: [{library: ReactStrapService, items: ['Container']}],
        code: '<Container></Container>'
    }

    dataService

    componentWillMount() {
        PubsubService.sub(PubsubService.KEY_OPEN_PAGE).subscribe(value=> {
            if (value) {
                const layout = DataService.get(value)
                this.setState({
                    page: value,
                    imports:layout.imports,
                    code:layout.code
                })
            }
        })
        PubsubService.sub(PubsubService.KEY_LAYOUT_UPDATED).subscribe(value=> {
            if (value) {
                console.log(DataService.data[this.state.page])
                const layout = DataService.get(this.state.page)
                this.setState({
                    imports:layout.imports,
                    code: layout.code
                })
            }
        })
        PubsubService.sub(PubsubService.KEY_SELECT_ELEMENT).subscribe(item=> {
            if (item) {
                const layout = DataService.get(this.state.page, item.id)
                this.setState({
                    selected: item,
                    imports:layout.imports,
                    code: layout.code
                })
            }
        })
        PubsubService.sub(PubsubService.KEY_INSERT_COMPONENT).subscribe(item=> {
            if (item && this.state.selected) {
                DataService.insert(this.state.page, item, this.state.selected)
                PubsubService.pub(PubsubService.KEY_LAYOUT_UPDATED, true)
            }
        })
    }

    render() {
        const imp = {React}
        this.state.imports.forEach(lib=> {
            lib.items.forEach(item=> {
                imp[item] = lib.library.get(item)
            })
        })
        
        return <div id="design">
            <CodeSandbox imports={imp}>
            {'render(' +this.state.code + ')'}
            </CodeSandbox>
        </div>
    }
}
