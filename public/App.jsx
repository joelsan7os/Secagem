import React, { Suspense, lazy } from 'react';
import MVPSecagem from './MVPSecagem';

const PG = lazy(() => import('./pg'));

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

function lerModoPG() {
  try {
    return localStorage.getItem("vertice_modo") === "pg" && !!localStorage.getItem("perfil_ativo_h2");
  } catch { return false; }
}

function lerTV() {
  try {
    return location.hash.replace("#","").toLowerCase() === "tv" && !!localStorage.getItem("perfil_ativo_h2");
  } catch { return false; }
}

export default function App() {
  const tvPG = lerTV();
  const modoPG = lerModoPG() || tvPG;
  return (
    <ErrorBoundary>
      {modoPG ? (
        <Suspense fallback={
          <div style={{minHeight:"100vh",background:"#04111D",display:"flex",alignItems:"center",justifyContent:"center",color:"#5090FF",fontFamily:"monospace",fontSize:12,letterSpacing:".3em"}}>
            CARREGANDO PG…
          </div>
        }>
          <PG tv={tvPG}/>
        </Suspense>
      ) : <MVPSecagem/>}
    </ErrorBoundary>
  );
}
