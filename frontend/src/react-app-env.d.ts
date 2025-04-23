/// <reference types="react-scripts" />

// Google OAuth types
interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
      }) => void;
      renderButton: (
        element: HTMLElement | null,
        options: {
          type?: string;
          theme?: string;
          size?: string;
          text?: string;
          shape?: string;
          logo_alignment?: string;
          width?: number;
        }
      ) => void;
      prompt: () => void;
    };
  };
}

interface Window {
  google?: Google;
}

