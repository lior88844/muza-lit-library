import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { AdminUploadPage, type UploadItem } from "~/components/adminUpload";
import { extractAlbumDiscoverMetadata } from "~/lib/flacMetadata";
import { extractAlbumMetadataSimple } from "~/lib/utils/simpleFlacMetadata";
import { discoverAlbum } from "~/components/adminUpload/services/albumLookup";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

const isFlacFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".flac");
};

// Error codes and their explanations
const ERROR_CODES = {
  1001: {
    code: "1001",
    title: "All Files Invalid",
    description:
      "No FLAC files found in this folder. All files were skipped because they are not in FLAC format.",
  },
  1002: {
    code: "1002",
    title: "Partial Upload",
    description:
      "Some files were skipped because they are not in FLAC format. Only FLAC files will be processed.",
  },
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

export default function AdminUpload() {
  const navigate = useNavigate();
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newItems: UploadItem[] = [];

    // Filter for FLAC files only
    const flacFiles = files.filter(isFlacFile);

    // Group all files by folder path to track folders with no FLAC files
    const allFolderMap = new Map<string, File[]>();
    const flacFolderMap = new Map<string, File[]>();

    // First, group all files by folder
    files.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const folderPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "root";

      if (!allFolderMap.has(folderPath)) {
        allFolderMap.set(folderPath, []);
      }
      allFolderMap.get(folderPath)!.push(file);
    });

    // Then, group FLAC files by folder
    flacFiles.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const folderPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "root";

      if (!flacFolderMap.has(folderPath)) {
        flacFolderMap.set(folderPath, []);
      }
      flacFolderMap.get(folderPath)!.push(file);
    });

    // Filter out parent folders that have child folders in the list
    const allFolderPaths = Array.from(flacFolderMap.keys());
    const filteredFolderPaths = allFolderPaths.filter(path => {
      // Keep this folder if no other folder in the list has it as a prefix (i.e., it's not a parent)
      return !allFolderPaths.some(
        otherPath => otherPath !== path && otherPath.startsWith(path + "/")
      );
    });

    // Create items for folders with FLAC files (excluding parent folders)
    for (const path of filteredFolderPaths) {
      const folderFiles = flacFolderMap.get(path)!;
      const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0);
      const folderName =
        path === "root" ? "Music Folder" : path.split("/").pop() || path;

      // Check if this folder has non-FLAC files that were skipped
      const allFilesInFolder = allFolderMap.get(path) || [];
      const skippedCount = allFilesInFolder.length - folderFiles.length;

      const newItem: UploadItem = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: "folder",
        size: totalSize,
        files: folderFiles,
        path,
        errorCode: skippedCount > 0 ? ("1002" as const) : undefined,
        isLookingUp: true, // Start lookup for all items with FLAC files
        loadingState: {
          status: "loading",
          loadedFiles: 0,
          totalFiles: folderFiles.length,
          progress: 0,
        },
      };

      newItems.push(newItem);
    }

    // Create error items for folders with no FLAC files (excluding parent folders)
    const allFoldersWithoutFlac = Array.from(allFolderMap.keys()).filter(
      path => !flacFolderMap.has(path)
    );

    const filteredErrorFolderPaths = allFoldersWithoutFlac.filter(path => {
      // Keep this folder if no other folder in allFolderMap has it as a prefix
      return !Array.from(allFolderMap.keys()).some(
        otherPath => otherPath !== path && otherPath.startsWith(path + "/")
      );
    });

    filteredErrorFolderPaths.forEach(path => {
      const folderName =
        path === "root" ? "Music Folder" : path.split("/").pop() || path;

      newItems.push({
        id: `error-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: "folder",
        size: 0,
        files: [],
        path,
        errorCode: "1001" as const,
        loadingState: {
          status: "error",
          loadedFiles: 0,
          totalFiles: 0,
          progress: 0,
        },
      });
    });

    setUploadedItems(prev => [...prev, ...newItems]);
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);

    // Process metadata extraction and album discovery for each valid folder
    for (const item of newItems) {
      // Only process items without critical errors (error code 1001)
      if (item.files.length > 0 && item.errorCode !== "1001") {
        try {
          // Simulate loading progress for files
          const totalFiles = item.files.length;
          for (let i = 0; i < totalFiles; i++) {
            const loadedFiles = i + 1;
            const progress = Math.round((loadedFiles / totalFiles) * 100);

            // Update loading progress
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      loadingState: {
                        status: "loading",
                        loadedFiles,
                        totalFiles,
                        progress,
                      },
                    }
                  : prevItem
              )
            );

            // Small delay to show progress (remove in production if files load instantly)
            if (i < totalFiles - 1) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          // Extract simple metadata from the first FLAC file
          const simpleMetadata = extractAlbumMetadataSimple(item.files);

          // Mark as fully loaded with metadata
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    metadata: simpleMetadata || undefined,
                    loadingState: {
                      status: "loaded",
                      loadedFiles: totalFiles,
                      totalFiles,
                      progress: 100,
                    },
                  }
                : prevItem
            )
          );

          // Extract complete metadata from the first FLAC file
          const metadata = await extractAlbumDiscoverMetadata(item.files);

          if (metadata) {
            // Discover album in backend
            const albumLookup = await discoverAlbum(metadata);

            // Update item with lookup result and remove loading state
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? { ...prevItem, albumLookup, isLookingUp: false }
                  : prevItem
              )
            );
          } else {
            // Failed to extract metadata
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? { ...prevItem, isLookingUp: false }
                  : prevItem
              )
            );
          }
        } catch (error) {
          console.error("Error processing album discovery:", error);
          // Remove loading state on error
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    isLookingUp: false,
                    loadingState: {
                      status: "error",
                      loadedFiles: item.files.length,
                      totalFiles: item.files.length,
                      progress: 0,
                    },
                  }
                : prevItem
            )
          );
        }
      }
    }
  }, []);

  const handleItemSelect = useCallback((index: number, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        const allIndices = Array.from(
          { length: uploadedItems.length },
          (_, i) => i
        );
        setSelectedItems(new Set(allIndices));
      } else {
        setSelectedItems(new Set());
      }
    },
    [uploadedItems.length]
  );

  const handleCancelSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const handleProcessUpload = useCallback(() => {
    const selectedItemList = Array.from(selectedItems).map(
      index => uploadedItems[index]
    );
    // TODO: Process selected items
    // eslint-disable-next-line no-console
    console.log("Processing items:", selectedItemList);
  }, [selectedItems, uploadedItems]);

  const handleManualIdChange = useCallback(
    (itemId: string, albumId: number | undefined) => {
      setUploadedItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, manualAlbumId: albumId } : item
        )
      );
    },
    []
  );

  const handleCoverUpload = useCallback((itemId: string, file: File) => {
    console.log(
      "Cover upload handler called for item:",
      itemId,
      "with file:",
      file.name
    );
    setUploadedItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          console.log("Updating item with cover image:", item.name);
          return { ...item, coverImage: file };
        }
        return item;
      })
    );
  }, []);

  const handleCoverRemove = useCallback((itemId: string) => {
    console.log("Cover remove handler called for item:", itemId);
    setUploadedItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          console.log("Removing cover image from item:", item.name);
          return { ...item, coverImage: undefined };
        }
        return item;
      })
    );
  }, []);

  const handleCancel = useCallback(() => {
    setUploadedItems([]);
    setSelectedItems(new Set());
    setIsScanning(false);
    setCurrentPage(1);
    navigate("/");
  }, [navigate]);

  return (
    <AdminUploadPage
      uploadedItems={uploadedItems}
      selectedItems={selectedItems}
      isScanning={isScanning}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onFileUpload={handleFileUpload}
      onItemSelect={handleItemSelect}
      onSelectAll={handleSelectAll}
      onCancelSelection={handleCancelSelection}
      onProcessUpload={handleProcessUpload}
      onCancel={handleCancel}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
      onManualIdChange={handleManualIdChange}
      onCoverUpload={handleCoverUpload}
      onCoverRemove={handleCoverRemove}
    />
  );
}
