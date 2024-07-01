import { Layout, Upload, Flex, message, Button, Card } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import TableData from "../TableData";

function AppContent({ isPhone, isTablet }) {
    const contentStyle = {
        textAlign: 'center',
        minHeight: 'calc(100vh - 150px - 355px)',
        backgroundColor: 'white',
        marginBottom: 30,
        padding: isTablet || isPhone ? 20 : 40,
    };

    const ip_address = process.env.REACT_APP_SERVER_IP_ADDRESS;
    const port = process.env.REACT_APP_SERVER_PORT;

    const [index, setIndex] = useState('1');

    const [fileListAS_IS, setFileListAS_IS] = useState([]);
    const [fileListTO_BE, setFileListTO_BE] = useState([]);

    const [analyzeAS_IS, setAnalyzeAS_IS] = useState([]);
    const [analyzeTO_BE, setAnalyzeTO_BE] = useState([]);
    const [analyzeOverall, setAnalyzeOverall] = useState([]);

    const [openAS_IS, setAS_IS] = useState(true);
    const [openTO_BE, setTO_BE] = useState(true);
    const [openOverall, setOverall] = useState(true);

    const [updateAS_IS, setUpdateAS_IS] = useState(false);
    const [updateTO_BE, setUpdateTO_BE] = useState(false);

    useEffect(() => {
        if (updateAS_IS) {
            overallAnalyze();
            setUpdateAS_IS(false);
        }

        if (updateTO_BE) {
            overallAnalyze();
            setUpdateTO_BE(false);
        }
    
    }, [analyzeAS_IS, analyzeTO_BE, analyzeOverall]);
    
    function customBeforeUpload(file) {
        try {
            const isBpmn = file.name.endsWith('.bpmn');
            const isXML = file.name.endsWith('.xml');

            if (!isBpmn && !isXML) {
                message.error('You can only upload .BPMN || .XML files!');
                return Upload.LIST_IGNORE;
            }

            return true;
        } catch (error) {
            console.log(error);
            message.error(error);
        }
    }

    const propsAS_IS = {
        beforeUpload: customBeforeUpload,
        customRequest: async (post) => {
            const { file, onSuccess, onError } = post;
            try {
                const formData = new FormData();
                formData.append('file', file);
                await uploadAS_IS(formData);

                onSuccess("ok");
            } catch (error) {
                console.log(error);
                onError(error);
                message.error(error);
            }
        },
        showUploadList: {
            showDownloadIcon: false,
            showRemoveIcon: false,
            showPreviewIcon: false
        },
        onChange: (info) => {
            const { fileList } = info;
            
            const updatedFileList = fileList.map(file => {
                if (file.name.length > 40) {
                    const truncatedName = file.name.substring(0, 40);
                    return {
                        ...file,
                        name: truncatedName
                    };
                }
                return file;
            });

            setFileListAS_IS(updatedFileList);
        },
        fileList: fileListAS_IS,
    };

    const propsTO_BE = {
        beforeUpload: customBeforeUpload,

        customRequest: async (post) => {
            const { file, onSuccess, onError } = post;
            try {
                const formData = new FormData();
                formData.append('file', file);
                await uploadTO_BE(formData);

                onSuccess("ok");
            } catch (error) {
                console.log(error);
                message.error(error);
                onError(error);
            }
        },
        showUploadList: {
            showDownloadIcon: false,
            showRemoveIcon: false,
        },
        onChange: (info) => {
            const { fileList } = info;
            
            const updatedFileList = fileList.map(file => {
                if (file.name.length > 40) {
                    const truncatedName = file.name.substring(0, 40);
                    return {
                        ...file,
                        name: truncatedName
                    };
                }
                return file;
            });

            setFileListTO_BE(updatedFileList);
        },
        fileList: fileListTO_BE,
    };

    const uploadAS_IS = async (formData) => {
        try {
            const response = await fetch(`http://${ip_address}:${port}/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.analyze) {
                    setAnalyzeAS_IS(data.analyze);
                    setAS_IS(false);

                    if (!openTO_BE && !openOverall) {
                        setUpdateAS_IS(true);
                    }
                }
            } else {
                message.error(error);
            }
        } catch (error) {
            message.error(error)
        }
    };

    const uploadTO_BE = async (formData) => {
        try {
            const response = await fetch(`http://${ip_address}:${port}/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.analyze) {
                    setAnalyzeTO_BE(data.analyze);
                    setTO_BE(false);

                    if (!openAS_IS && !openOverall) {
                        setUpdateTO_BE(true);
                    }
                }
            } else {
                message.error('Error');
            }
        } catch (error) {
            message.error(error)
        }
    };

    const overallAnalyze = async () => {
        try {
            const response = await fetch(`http://${ip_address}:${port}/overall/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "result": { "as_is": analyzeAS_IS, "to_be": analyzeTO_BE } }),
            });

            if (response.ok) {
                const data = await response.json();
                setAnalyzeOverall(data);
            } else {
                message.error('Error');
            }
        } catch (error) {
            message.error(error);
        }
    }

    function resetAll() {
        try {
            setAS_IS(true);
            setTO_BE(true);
            setOverall(true);
            setAnalyzeAS_IS([]);
            setAnalyzeTO_BE([]);
            setFileListAS_IS([]);
            setFileListTO_BE([]);
            setIndex(1);
        } catch (error) {
            console.log(error)
            message.error(error);
        }
    }

    useEffect(() => {
        try {
            const overall = async () => {
                if (openOverall) {
                    if (!openAS_IS & !openTO_BE) {
                        await overallAnalyze();
                        setOverall(false);
                    }
                }
            }

            overall();
        } catch (error) {
            console.log(error);
            message.error(error);
        }
    })

    const onClickCSV = async () => {
        try {
            await downloadCSV();
        } catch (error) {
            console.log(error)
        }
    }

    const downloadCSV = async () => {
        try {
            const response = await fetch(`http://${ip_address}:${port}/download-overall/csv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "result": { "as_is": analyzeAS_IS, "to_be": analyzeTO_BE, "overall": analyzeOverall } })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Overall.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                message.error("Ошибка при скачивании");
            }
        } catch (error) {
            message.error(error);
        }
    }

    const onClickXLSX = async () => {
        try {
            await downloadXLSX();
        } catch (error) {
            console.log(error)
        }
    }

    const downloadXLSX = async () => {
        try {
            const response = await fetch(`http://${ip_address}:${port}/download-overall/xlsx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "result": { "as_is": analyzeAS_IS, "to_be": analyzeTO_BE, "overall": analyzeOverall } })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Overall.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                message.error("Ошибка при скачивании");
            }
        } catch (error) {
            message.error(error);
        }
    };

    if (isPhone) {
        return (
            <Layout.Content style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                    <div style={{ backgroundColor: 'blue', height: 60, display: 'flex', borderRadius: 20, width: isTablet ? 600 : 300, alignItems: 'center', justifyContent: 'center' }}>
                        <h3 style={{ color: 'white', fontSize: isTablet ? 26 : 13 }}>Расчет Эффективности Бизнес-процессов</h3>
                    </div>
                </div>
                <Flex vertical style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center', alignItems: 'center', marginTop: 50, gap: 50 }}>
                    <div>
                        <Flex vertical gap={30} style={{ alignItems: 'center' }}>
                            <div style={{ width: 300, height: 250, backgroundColor: '#fff', borderRadius: 25, border: '2px dashed #6F7680', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }}>
                                <Upload {...propsAS_IS} maxCount={1} multiple={false}>
                                    <div>
                                        <img src="./src/assets/upload.jpg" alt="upload" style={{ display: 'flex', borderRadius: 20 }} />
                                        <div style={{ textAlign: 'left', marginTop: 20 }}>
                                            <h4 style={{ fontSize: 24 }}>Загрузите AS-IS</h4>
                                            <p style={{ color: '#FF0000' }}>формат .bpmn .xml</p>

                                            <div style={{ display: 'flex', marginTop: 40 }}>
                                                <p style={{ color: "#6B7077", fontSize: 16 }}>или перетащите файлы сюда</p>
                                                <PlusCircleOutlined style={{ marginLeft: 20, color: '#6F7680', fontSize: 22 }} />
                                            </div>
                                        </div>
                                    </div>
                                </Upload>
                            </div>
                            <div style={{ width: 300, height: 250, backgroundColor: '#fff', borderRadius: 25, border: '2px dashed #6F7680', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }}>
                                <Upload {...propsTO_BE} maxCount={1} multiple={false}>
                                    <div>
                                        <img src="./src/assets/upload.jpg" alt="upload" style={{ display: 'flex', borderRadius: 20 }} />
                                        <div style={{ textAlign: 'left', marginTop: 20 }}>
                                            <h4 style={{ fontSize: 24 }}>Загрузите TO-BE</h4>
                                            <p style={{ color: '#FF0000' }}>формат .bpmn .xml</p>

                                            <div style={{ display: 'flex', marginTop: 40 }}>
                                                <p style={{ color: "#6B7077", fontSize: 16 }}>или перетащите файлы сюда</p>
                                                <PlusCircleOutlined style={{ marginLeft: 20, color: '#6F7680', fontSize: 22 }} />
                                            </div>
                                        </div>
                                    </div>
                                </Upload>
                            </div>
                            <Button type="primary" onClick={resetAll}>Сбросить все</Button>
                        </Flex>
                    </div>
                    <Card>
                        <TableData as_is={analyzeAS_IS} to_be={analyzeTO_BE} overall={analyzeOverall} isPhone={isPhone} />
                        <Flex justify={'flex-end'} gap={20} style={{ float: 'left', width: '100%', marginTop: '20px' }}>
                            <Button type="primary" onClick={onClickCSV} disabled={openOverall}>.CSV</Button>
                            <Button type="primary" style={{ marginRight: '20px' }} onClick={onClickXLSX} disabled={openOverall}>.XLSX</Button>
                        </Flex>
                    </Card>
                </Flex>
            </Layout.Content>
        )
    } else {
        return (
            <Layout.Content style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                    <div style={{ backgroundColor: 'blue', height: 60, display: 'flex', borderRadius: 20, width: 650, alignItems: 'center', justifyContent: 'center' }}>
                        <h3 style={{ color: 'white', fontSize: 27 }}>Расчет Эффективности Бизнес-процессов</h3>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: isTablet ? 50 : 100, marginTop: 50 }}>
                    <div>
                        <Flex vertical gap={30}>
                            <div style={{ width: isTablet ? 250 : 340, height: isTablet ? 250 : 270, backgroundColor: '#fff', borderRadius: 25, border: '2px dashed #6F7680', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 20 }}>
                                <Upload {...propsAS_IS} maxCount={1} multiple={false}>
                                    <div style={{ textAlign: 'left', marginTop: 20 }}>
                                        <img src="./src/assets/upload.jpg" alt="upload" style={{ display: 'flex', borderRadius: 20 }} />
                                        <h4 style={{ fontSize: 24 }}>Загрузите AS-IS</h4>
                                        <p style={{ color: '#FF0000' }}>формат .bpmn .xml</p>

                                        <div style={{ display: 'flex', marginTop: 40 }}>
                                            <p style={{ color: "#6B7077", fontSize: 16 }}>или перетащите файлы сюда</p>
                                            <PlusCircleOutlined style={{ marginLeft: 20, color: '#6F7680', fontSize: 22 }} />
                                        </div>
                                    </div>
                                </Upload>
                            </div>
                            <div style={{ width: isTablet ? 250 : 340, height: isTablet ? 250 : 270, backgroundColor: '#fff', borderRadius: 25, border: '2px dashed #6F7680', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 20 }}>
                                <Upload {...propsTO_BE} maxCount={1} multiple={false}>
                                    <div>
                                        <img src="./src/assets/upload.jpg" alt="upload" style={{ display: 'flex', borderRadius: 20 }} />
                                        <div style={{ textAlign: 'left', marginTop: 20 }}>
                                            <h4 style={{ fontSize: 24 }}>Загрузите TO-BE</h4>
                                            <p style={{ color: '#FF0000' }}>формат .bpmn .xml</p>

                                            <div style={{ display: 'flex', marginTop: 40 }}>
                                                <p style={{ color: "#6B7077", fontSize: 16 }}>или перетащите файлы сюда</p>
                                                <PlusCircleOutlined style={{ marginLeft: 20, color: '#6F7680', fontSize: 22 }} />
                                            </div>
                                        </div>
                                    </div>
                                </Upload>
                            </div>
                            <Button type="primary" onClick={resetAll}>Сбросить все</Button>
                        </Flex>
                    </div>
                    <Card style={{ height: 550 }}>
                    <TableData as_is={analyzeAS_IS} to_be={analyzeTO_BE} overall={analyzeOverall} isPhone={isPhone} />
                        <Flex justify={'flex-end'} gap={20} style={{ float: 'left', width: '100%', marginTop: '20px' }}>
                            <Button type="primary" onClick={onClickCSV} disabled={openOverall}>.CSV</Button>
                            <Button type="primary" style={{ marginRight: '20px' }} onClick={onClickXLSX} disabled={openOverall}>.XLSX</Button>
                        </Flex>
                    </Card>
                </div>
            </Layout.Content>
        )
    }
}

export default AppContent;