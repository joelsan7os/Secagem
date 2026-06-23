import React from 'react';
import MVPSecagem from './MVPSecagem';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  componentDidCatch(error) {
    this.setState({ error });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{background:"#04111D",color:"#FF5252",padding:24,fontFamily:"monospace",fontSize:13,minHeight:"100vh"}}>
          <div style={{color:"#00E676",fontWeight:800,fontSize:16,marginBottom:12}}>⚠ ERRO DE INICIALIZAÇÃO</div>
          <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.error.toString()}</pre>
          <pre style={{color:"#B5C6DA",marginTop:12,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MVPSecagem />
    </ErrorBoundary>
  );
}
