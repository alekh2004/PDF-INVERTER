"use client";

import React, { createContext, useContext, useState } from "react";

interface FileContextType {
    file: File | null;
    setFile: (file: File | null) => void;
    fileData: string | ArrayBuffer | null; // For preview optimization
    setFileData: (data: string | ArrayBuffer | null) => void;
    downloadModal: {
        isOpen: boolean;
        fileName: string;
        fileData: Uint8Array | null;
        open: (data: Uint8Array, name: string) => void;
        close: () => void;
    };
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
    const [file, setFile] = useState<File | null>(null);
    const [fileData, setFileData] = useState<string | ArrayBuffer | null>(null);

    // Modal State
    const [modalState, setModalState] = useState({
        isOpen: false,
        fileName: "",
        fileData: null as Uint8Array | null
    });

    const openModal = (data: Uint8Array, name: string) => {
        setModalState({ isOpen: true, fileName: name, fileData: data });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <FileContext.Provider value={{
            file, setFile, fileData, setFileData,
            downloadModal: { ...modalState, open: openModal, close: closeModal }
        }}>
            {children}
        </FileContext.Provider>
    );
}

export function useFileStore() {
    const context = useContext(FileContext);
    if (context === undefined) {
        throw new Error("useFileStore must be used within a FileProvider");
    }
    return context;
}
