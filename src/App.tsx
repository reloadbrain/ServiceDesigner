import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Home from './views/home.view'
import Sidebar from './views/sidebar/sidebar.view'
import { Intro } from './views/intro.view'
import { FrameView } from './views/frame.view';
import { HomeView } from './layout/Home.view';
import { Menu } from './utils/Menu';
import { connectRouter } from './redux/connection';
import { bindActionCreators } from 'redux';
import * as layoutActions from './layout/Layout.actions';
import * as componentActions from './component/Component.action';
import * as resourceActions from './resource/Resource.actions';
import { Theme } from './utils/Theme';
import _ from 'lodash';
import Utils from './utils/utils';
import { RenderService } from './board/Render.service';
import { DeprecateService } from './utils/Deprecate';


class App extends React.Component<any> { 

    componentWillMount() {
        new Menu().init(
            (json) => {
                const { LayoutActions, ResourceActions, ComponentActions } = this.props;
                try {
                    const data = JSON.parse(json);
                    if (data.version === 2) {
                        ResourceActions.loadResource(data.resource);
                        ComponentActions.loadComponent(data.components);
                    } else {
                        const deprecateService =  new DeprecateService().parseVersion1(data);
                        ResourceActions.loadResource(deprecateService.toResource());
                        ComponentActions.loadComponent(deprecateService.toComponents());
                    }
                    LayoutActions.message({
                        background: Theme.primary,
                        color: Theme.primaryFont,
                        text: 'Loaded Successfully'
                    })
                } catch(e) {
                    console.log(e)
                    LayoutActions.message({
                        background: Theme.danger,
                        color: Theme.dangerFont,
                        text: 'Load Failed'
                    })
                }
            },  // load File : input data
            async () => {
                const { data, LayoutActions } = this.props;
                try {
                    const copiedComponents = _.cloneDeep(data.component.files);
                    copiedComponents.forEach(comp=> {
                        Utils.loop(comp, (item)=> {
                            delete item.parent;
                            Utils.loop(item.element, (elem)=> {
                                delete elem.parent;
                            })
                        })
                    })
                    const json = {
                        version: 2,
                        components: copiedComponents,
                        resource: data.resource
                    }
                    const renderService = new RenderService().renderAll(copiedComponents, {
                        color: data.resource.color,
                        asset: data.resource.asset,
                        css: data.resource.css
                    })
                    LayoutActions.message({
                        background: Theme.primary,
                        color: Theme.primaryFont,
                        text: 'Save Successfully'
                    })
                    return Promise.resolve({
                        json:JSON.stringify(json),
                        js: renderService.toJs(),
                        css: await renderService.toCss()
                    })
                } catch(e) {
                    console.log(e)
                    LayoutActions.message({
                        background: Theme.danger,
                        color: Theme.dangerFont,
                        text: 'Save Failed'
                    })
                    return Promise.resolve(undefined)
                }
            }                        // save File : return {json, js, css}
        )
    }

    render() {
        return (
        <div>
            <Switch>
                <Route exact path="/dev"  component={HomeView} />
                <Route exact path="/frame" component={FrameView} />
                <Route path="*" render={()=> 
                    <Sidebar>
                    <Switch>
                        <Route exact path="/intro" component={Intro} />
                        <Route exact path="/home" component={Home} />
                        <Route path="*" render={() => (<Redirect to="/intro" />)} />
                    </Switch>
                    </Sidebar>
                } />
            </Switch>
        </div>
        );
    }
}

export default connectRouter(
    (state)=>({
        data: {
            component: state.component,
            resource: state.resource,
            layout: state.layout
        }
    }),
    (dispatch)=>({
        LayoutActions: bindActionCreators(layoutActions, dispatch),
        ResourceActions: bindActionCreators(resourceActions, dispatch),
        ComponentActions: bindActionCreators(componentActions, dispatch)
    }),
    App
);
