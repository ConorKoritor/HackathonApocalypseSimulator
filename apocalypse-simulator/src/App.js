import React, { Component } from 'react';

class App extends Component {
    // Dynamically add the script in componentDidMount
    componentDidMount() {
        const script = document.createElement("script");
        script.src = "/map.js"; // Assuming map.js is in the public folder
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <div>
                <h1>Hello, World!</h1>
            </div>
        );
    }
}

// Export the App component as the default export
export default App;