"use client"

import { useState, useEffect } from "react";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import CreateFileModal from "./CreateFileModal";
import { createFolder } from "./folderUtils";

const CollapsibleBlock = ({ name, isFile, depth, onToggle, isCollapsed, onContextMenu }) => {
    if (name == ".hidden") return null;
    return (
        <div 
            className="py-1 px-5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onContextMenu={onContextMenu}
            style={{ marginLeft: depth * 12 }}
        >
            <div 
                className="flex items-center cursor-pointer text-gray-800 dark:text-gray-200"
                onClick={onToggle}
            >
                {isFile ? (
                    <FaFile className="mr-3" />
                ) : (
                    isCollapsed ? <FaFolder className="mr-3" /> : <FaFolderOpen className="mr-3" />
                )}
                <span className="font-semibold select-none">{name}</span>
            </div>
        </div>
    );
};

const TreeView = ({ paths, handleCreateFileClick, handleCreateFolderClick }) => {
    const [collapsed, setCollapsed] = useState({});
    const [contextMenu, setContextMenu] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenu && !event.target.closest('.context-menu')) {
                setContextMenu(null);
            }
        };

        const handleKeyPress = (event) => {
            if (contextMenu && (event.key === 'Escape' || event.key === 'Enter')) {
                setContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [contextMenu]);

    const toggleCollapse = (path) => {
        setCollapsed(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleContextMenu = (event, path, isFile) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            path: path,
            isFile: isFile,
        });
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const sortedPaths = [...paths].sort((a, b) => a.path.localeCompare(b.path));
    const blocks = {};

    sortedPaths.forEach(obj => {
        const parts = obj.path.split('/');
        let current = blocks;

        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = { children: {}, isFile: false };
            }
            if (index === parts.length - 1) {
                current[part].isFile = true;
            }
            current = current[part].children;
        });
    });

    const renderBlocks = (blocks, depth = 0, parentPath = '') => {
        return Object.keys(blocks).map((key, index) => {
            const path = parentPath ? `${parentPath}/${key}` : key;
            const isCollapsed = collapsed[path];
            return (
                <div key={index}>
                    <CollapsibleBlock 
                        name={key} 
                        isFile={blocks[key].isFile} 
                        depth={depth} 
                        onToggle={() => toggleCollapse(path)} 
                        isCollapsed={isCollapsed} 
                        onContextMenu={(e) => handleContextMenu(e, path, blocks[key].isFile)}
                    />
                    {!isCollapsed && !blocks[key].isFile && renderBlocks(blocks[key].children, depth + 1, path)}
                </div>
            );
        });
    };

    const renderContextMenu = () => (
        contextMenu && (
            <div
                className="fixed context-menu"
                style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-gray-700 shadow-lg rounded-md p-4">
                    <div className="mb-4 text-gray-800 dark:text-gray-200">
                        Path: {contextMenu.path}
                    </div>
                    {!contextMenu.isFile && (
                        <>
                            <button 
                                className="block text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-md mb-2"
                                onClick={() => {
                                    handleCreateFileClick(contextMenu.path);
                                    handleClose();
                                }}
                            >
                                Create File
                            </button>
                            <button 
                                className="block text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-md mb-2"
                                onClick={() => {
                                    handleCreateFolderClick(contextMenu.path);
                                    handleClose();
                                }}
                            >
                                Create Folder
                            </button>
                        </>
                    )}
                    <button className="block text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-md">
                        Delete
                    </button>
                </div>
            </div>
        )
    );

    return (
        <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
            <h2 className="text-xl font-bold py-2 text-center text-gray-700 dark:text-gray-200 border-b">Directory Tree</h2>
            <div className="overflow-y-auto flex-1 p-1">
                {renderBlocks(blocks)}
            </div>
            {renderContextMenu()}
        </div>
    );
};

export default function FileTree({ paths, room }) {
    console.log(paths);
    const [localPaths, setLocalPaths] = useState(paths);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setLocalPaths(paths); // Update localPaths when paths prop changes
    }, [paths]);

    const createFile = (parentPath, fileName) => {
        const newPath = parentPath ? `${parentPath}/${fileName}` : fileName;
        const newPathObj = {
            room_id: Date.now().toString(),
            path: newPath
        };
        const updatedPaths = [...localPaths, newPathObj];
        setLocalPaths(updatedPaths);
    };

    const handleCreateFileClick = (path) => {
        setCurrentPath(path);
        setIsModalOpen(true);
    };

    const handleCreateFolderClick = (path) => {
        const folderName = prompt("Enter folder name");
        createFolder(path, folderName, localPaths, setLocalPaths, null, room);
    };

    return (
        <>
            <TreeView 
                paths={localPaths} 
                handleCreateFileClick={handleCreateFileClick} 
                handleCreateFolderClick={handleCreateFolderClick} 
            />
            <CreateFileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(fileName) => createFile(currentPath, fileName)}
            />
        </>
    );
}
