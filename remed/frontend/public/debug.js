// Debug utility to help diagnose white screen issues
(function() {
  // Check if the page is actually white (no rendered content)
  function checkForWhiteScreen() {
    const rootElement = document.getElementById('root');
    console.log('[Debug] Root element:', rootElement);
    
    if (rootElement && (!rootElement.children || rootElement.children.length === 0)) {
      console.error('[Debug] WHITE SCREEN DETECTED: Root element has no children');
      displayDebugOverlay('White screen detected. React app failed to render.');
    }
  }
  
  // Display an overlay with debug information
  function displayDebugOverlay(message) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.padding = '10px';
    overlay.style.background = 'rgba(255,0,0,0.8)';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'monospace';
    overlay.style.fontSize = '14px';
    overlay.style.zIndex = '9999';
    overlay.style.maxHeight = '50%';
    overlay.style.overflow = 'auto';
    
    const errorDisplay = document.createElement('div');
    errorDisplay.textContent = message;
    overlay.appendChild(errorDisplay);
    
    const detailsDisplay = document.createElement('div');
    detailsDisplay.style.marginTop = '10px';
    detailsDisplay.style.fontSize = '12px';
    
    // Add browser info
    detailsDisplay.innerHTML += `<p>User Agent: ${navigator.userAgent}</p>`;
    detailsDisplay.innerHTML += `<p>URL: ${window.location.href}</p>`;
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Page';
    refreshButton.style.padding = '8px';
    refreshButton.style.marginTop = '10px';
    refreshButton.style.background = 'white';
    refreshButton.style.color = 'black';
    refreshButton.style.border = 'none';
    refreshButton.style.cursor = 'pointer';
    refreshButton.onclick = () => window.location.reload();
    
    overlay.appendChild(detailsDisplay);
    overlay.appendChild(refreshButton);
    document.body.appendChild(overlay);
  }
  
  // Listen for global errors
  window.addEventListener('error', function(event) {
    console.error('[Debug] Uncaught error:', event.error);
    displayDebugOverlay(`Runtime error: ${event.message}`);
  });
  
  // Check if React rendered after a timeout
  window.addEventListener('load', function() {
    console.log('[Debug] Window loaded');
    // Wait for React to render
    setTimeout(checkForWhiteScreen, 3000);
  });
  
  console.log('[Debug] Debug script initialized');
})(); 