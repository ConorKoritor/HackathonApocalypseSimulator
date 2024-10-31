import React, { Component } from 'react';

class App extends Component {
    componentDidMount() {
        // Dynamically add the map.js script
        const script = document.createElement('script');
        script.src = '/map.js'; // Make sure this file is in the public folder
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <div>
                <div id="vis"></div>
                <div id="map-text"></div>
            </div>
        );
    }
}

export default App;