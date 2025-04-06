'use client';

import { useEffect } from 'react';

const AgentInjector: React.FC = () => {
  useEffect(() => {
    // --- Prevent duplicate injection ---
    if (document.getElementById('agentContainer')) {
      return;
    }

    // --- 1. Create CSS Styles ---
    const styleElement = document.createElement('style');
    styleElement.id = 'agent-custom-styles';
    styleElement.innerHTML = `
      #agentContainer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 480px;
        border: 1px solid #ccc; /* Adjust color if needed */
        background-color: #fff; /* Adjust color if needed */
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        border-radius: 8px; /* Added slight rounding */
        overflow: hidden; /* Ensure content respects border radius */
      }
      #agentHeader {
        background-color: #f1f1f1; /* Adjust color if needed */
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: default;
        user-select: none;
        border-bottom: 1px solid #ccc; /* Added border */
      }
      #agentHeader > span {
        font-weight: 600; /* Made title bolder */
      }
      #agentHeader > div {
        display: flex;
        align-items: center;
      }
      #agentHeader button {
        background: none;
        border: none;
        font-size: 18px; /* Slightly larger */
        font-weight: bold;
        line-height: 1;
        margin-left: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px; /* Adjusted size */
        height: 24px; /* Adjusted size */
        border-radius: 4px;
        color: #555; /* Added default color */
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      #minimizeButton {
        padding-bottom: 10px; /* Adjusted padding */
      }
      #agentHeader button:hover {
        background-color: #e0e0e0; /* Adjust color if needed */
        color: #000;
      }
      #agentContent {
        flex-grow: 1;
        overflow: hidden;
        background-color: #fff; /* Ensure content bg */
      }
      agent-standard {
         width: 100%;
         height: 100%;
         display: block; /* Ensure it takes space */
      }
    `;
    document.head.appendChild(styleElement);

    // --- 2. Create HTML Structure ---
    const agentContainer = document.createElement('div');
    agentContainer.id = 'agentContainer';

    const agentHeader = document.createElement('div');
    agentHeader.id = 'agentHeader';

    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'Assistant';

    const headerControls = document.createElement('div');

    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'minimizeButton';
    minimizeButton.title = 'Minimize';
    minimizeButton.innerHTML = '_'; // Using underscore

    const closeButton = document.createElement('button');
    closeButton.id = 'closeButton';
    closeButton.title = 'Close';
    closeButton.innerHTML = '×'; // Using multiplication sign

    headerControls.appendChild(minimizeButton);
    headerControls.appendChild(closeButton);
    agentHeader.appendChild(headerTitle);
    agentHeader.appendChild(headerControls);

    const agentContent = document.createElement('div');
    agentContent.id = 'agentContent';

    const agentStandardElement = document.createElement('agent-standard');
    // Removed inline style, handled by CSS rule now

    agentContent.appendChild(agentStandardElement);
    agentContainer.appendChild(agentHeader);
    agentContainer.appendChild(agentContent);

    document.body.appendChild(agentContainer);

    // --- 3. Add Button Logic ---
    const minimizeHandler = () => {
      if (agentContent.style.display === 'none') {
        agentContent.style.display = 'block';
        agentContainer.style.height = '480px';
        minimizeButton.innerHTML = '_'; // Show minimize symbol
      } else {
        agentContent.style.display = 'none';
        agentContainer.style.height = 'auto'; // Adjust height to fit header
        minimizeButton.innerHTML = '□'; // Show restore symbol
      }
    };

    const closeHandler = () => {
      agentContainer.style.display = 'none';
      // Optional: Add logic to re-open it later if needed
    };

    minimizeButton.addEventListener('click', minimizeHandler);
    closeButton.addEventListener('click', closeHandler);

    // --- 4. Initialize Agent ---
    // Dynamically import the agent script AFTER the container is ready
    const agentScript = document.createElement('script');
    agentScript.type = 'module';
    agentScript.id = 'agent-loader-script';
    agentScript.innerHTML = `
      import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js';
      Agent.initStandard({
        agentName: "Assistant OpenAI-979ca", // From your new example
        apiHost: "https://app.predictabledialogs.com/web/incoming", // From your new example
        initialPrompt: "Hi",
        target: document.querySelector('#agentContent agent-standard') // Explicitly target the element
      });
    `;
    document.body.appendChild(agentScript); // Append script to body

    // --- 5. Cleanup Function ---
    return () => {
      minimizeButton.removeEventListener('click', minimizeHandler);
      closeButton.removeEventListener('click', closeHandler);

      const container = document.getElementById('agentContainer');
      if (container) {
        document.body.removeChild(container);
      }
      const styles = document.getElementById('agent-custom-styles');
      if (styles) {
        document.head.removeChild(styles);
      }
      const loaderScript = document.getElementById('agent-loader-script');
      if (loaderScript) {
        document.body.removeChild(loaderScript);
      }
      // Note: The agent itself might have internal cleanup, but we remove its container and script.
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component doesn't render anything itself
};

export default AgentInjector;
