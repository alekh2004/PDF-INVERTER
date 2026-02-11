"use client";

import { useFileStore } from "./FileContext";
import { DownloadModal } from "./DownloadModal";

export const GlobalModal = () => {
    const { downloadModal } = useFileStore();

    return (
        <DownloadModal
            isOpen={downloadModal.isOpen}
            onClose={downloadModal.close}
            fileName={downloadModal.fileName}
            fileData={downloadModal.fileData}
        />
    );
};
