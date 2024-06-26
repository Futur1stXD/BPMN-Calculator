import { Layout, Divider, Space, Flex } from 'antd';
import { YoutubeOutlined, InstagramOutlined, FacebookOutlined } from '@ant-design/icons';

function AppFooter({ isPhone }) {
    const footerStyle = {
        backgroundColor: '#112F82',
        padding: '20px',
        color: 'white'
    };

    if (isPhone) {
        return (
            <Layout.Footer style={footerStyle}>
                <Space direction='vertical' size="large" style={{ width: '100%', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <a href='https://govtec.kz'>
                            <img src="./src/assets/dgsc-logo-bg.png" alt="dgsc-logo-bg" style={{ width: isPhone ? 120 : 170, height: isPhone ? 30 : 44 }} />
                        </a>
                        <p>Центр поддержки цифрового правительства</p>
                        <Space size="middle">
                            <a href='https://www.youtube.com/channel/UCu0nw4Hjs9BJ7GS5iDhoAXg' target="_blank">
                                <YoutubeOutlined style={{ fontSize: '24px' }} />
                            </a>
                            <a href='https://www.instagram.com/dgsc.kz?igshid=NDRkN2NkYzU%3D' target="_blank">
                                <InstagramOutlined style={{ fontSize: '24px' }} />
                            </a>
                            <a href='https://www.facebook.com/100071407635114/posts/199314672431860/' target="_blank">
                                <FacebookOutlined style={{ fontSize: '24px' }} />
                            </a>
                        </Space>
                    </div>
                    <div style={{ display: 'flex', flexDirection: isPhone ? 'column' : 'row', gap: '20px' }}>
                        <div>
                            <h2>Компания</h2>
                            <p><a href="https://govtec.kz">О центре</a></p>
                            <p><a href="https://govtec.kz/esc">Деятельность</a></p>
                            <p><a href="https://govtec.kz/competitions">Культура</a></p>
                            <p><a href="https://govtec.kz/news">Новости</a></p>
                        </div>
                        <div>
                            <h2>Адрес:</h2>
                            <p>г. Астана, проспект Мангилик Ел 55/5, здание С 2.4, 3 этаж</p>
                            <h2>Контакты</h2>
                            <p>+7(7172)73 52 99</p>
                            <h2>Почта:</h2>
                            <p>info@govtec.kz</p>
                        </div>
                    </div>
                </Space>
                <Divider style={{ background: 'white', margin: '20px 0'}} />
                <div style={{ textAlign: 'center' }}>
                    <p>© 2024, Все права защищены Центр поддержки цифрового правительства при поддержке FG-WEB</p>
                </div>
            </Layout.Footer>
        )
    } else {
        return (
            <Layout.Footer style={footerStyle}>
                <Flex vertical style={{ marginTop: 5 }}>
                    <Flex gap={100}>
                        <Flex vertical gap={30} style={{ marginTop: 10 }}>
                            <a href='https://govtec.kz'>
                                <img src="./src/assets/dgsc-logo-bg.png" alt="dgsc-logo-bg" style={{ width: 170, height: 44 }} />
                            </a>
                            <p style={{ color: 'white' }}>Центр поддержки цифрового правительства</p>
                            <Flex style={{ fontSize: 32, color: 'white' }} gap={30}>
                                <a href='https://www.youtube.com/channel/UCu0nw4Hjs9BJ7GS5iDhoAXg' target="_blank">
                                    <YoutubeOutlined />
                                </a>
                                <a href='https://www.instagram.com/dgsc.kz?igshid=NDRkN2NkYzU%3D' target="_blank">
                                    <InstagramOutlined />
                                </a>
                                <a href='https://www.facebook.com/100071407635114/posts/199314672431860/' target="_blank">
                                    <FacebookOutlined />
                                </a>
                            </Flex>
                        </Flex>

                        <Flex vertical gap={20} style={{ color: 'white' }}>
                            <h2>Компания</h2>
                            <p><a href="https://govtec.kz">О центре</a></p>
                            <p><a href="https://govtec.kz/esc">Деятельность</a></p>
                            <p><a href="https://govtec.kz/competitions">Культура</a></p>
                            <p><a href="https://govtec.kz/news">Новости</a></p>
                        </Flex>
                        <Flex vertical gap={20} style={{ color: 'white' }}>
                            <h2>Адрес:</h2>
                            <p>г. Астана, проспект Мангилик Ел 55/5,
                                здание С 2.4, 3 этаж</p>
                            <h2>Контакты</h2>
                            <p>+7(7172)73 52 99</p>
                            <h2>Почта:</h2>
                            <p>info@govtec.kz</p>
                        </Flex>

                    </Flex>
                    <Divider style={{ background: 'white' }} />
                    <Flex justify="center" style={{ color: 'white' }}>
                        <p>© 2024, Все права защищены Центр поддержки цифрового правительства при поддержке FG-WEB</p>
                    </Flex>
                </Flex>
            </Layout.Footer>
        );
    }
}

export default AppFooter;
