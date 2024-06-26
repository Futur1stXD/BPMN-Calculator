import { Dropdown, Layout, Flex } from "antd";
import { FacebookOutlined, InstagramOutlined, YoutubeOutlined, MenuOutlined } from '@ant-design/icons';

function AppHeader({isPhone, isTablet}) {
    const headerStyle = {
        color: 'black',
        height: '150px',
        backgroundColor: 'white',
        maxWidth: 'calc(100%)',
    };

    const dropDownItemsMobile = [
        { label: (<a href="https://govtec.kz">Главная</a>), key: "1" },
        { label: (<a href="https://govtec.kz/project-center">Деятельность</a>), key: "2" },
        { label: (<a href="https://govtec.kz/curs">Курсы</a>), key: "3" },
        { label: (<a href="https://govtec.kz/contacts">Контакты</a>), key: "4" },
    ];

    if (isPhone) {
        return (
            <Layout.Header style={headerStyle}>
                <div className="header-upper">
                    <div className="about" style={{ display: 'flex', gap: 10 }}>
                        <a href="https://govtec.kz">Сайт</a>
                        <a href="https://govtec.kz/news">Новости</a>
                        <a href="https://govtec.kz/competitions">Конкурсы</a>
                    </div>
                    <div className="social-media" style={{ display: 'flex', gap: 10 }}>
                        <a href="https://www.youtube.com/channel/UCu0nw4Hjs9BJ7GS5iDhoAXg" target='_blank'><YoutubeOutlined style={{ fontSize: '22px' }} /></a>
                        <a href='https://www.instagram.com/dgsc.kz?igshid=NDRkN2NkYzU%3D' target="_blank"><InstagramOutlined style={{ fontSize: '22px' }} /></a>
                        <a href='https://www.facebook.com/100071407635114/posts/199314672431860/' target="_blank"><FacebookOutlined style={{ fontSize: '22px' }} /></a>
                    </div>
                </div>

                <hr style={{ marginTop: 5, marginBottom: 5 }} />

                <Flex gap={'large'} style={{ alignItems: "center", justifyContent: 'space-between' }}>
                    <a href="https://govtec.kz" style={{ alignItems: "center", marginTop: 20 }}>
                        <img src="./src/assets/dgsc-logo.jpg" alt="logo" />
                    </a>

                    <Dropdown menu={{ items: dropDownItemsMobile }}>
                        <MenuOutlined style={{ color: 'black' }} />
                    </Dropdown>
                </Flex>
            </Layout.Header>
        )
    } else {
        return (
            <Layout.Header style={headerStyle}>
                <div className="header-upper">
                    <div className="about" style={{ display: 'flex', gap: 30 }}>
                        <a href="https://govtec.kz">Сайт</a>
                        <a href="https://govtec.kz/news">Новости</a>
                        <a href="https://govtec.kz/competitions">Конкурсы</a>
                    </div>
                    <div className="social-media" style={{ display: 'flex', gap: 20 }}>
                        <a href='https://www.youtube.com/channel/UCu0nw4Hjs9BJ7GS5iDhoAXg' target="_blank"><FacebookOutlined style={{ fontSize: '22px' }} /></a>
                        <a href='https://www.instagram.com/dgsc.kz?igshid=NDRkN2NkYzU%3D' target="_blank"><InstagramOutlined style={{ fontSize: '22px' }} /></a>
                        <a href='https://www.facebook.com/100071407635114/posts/199314672431860/' target="_blank"><YoutubeOutlined style={{ fontSize: '22px' }} /></a>
                    </div>
                </div>

                <hr style={{ marginTop: 5, marginBottom: 5 }} />

                <div className="header-lower">
                    <a href ="https://govtec.kz">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            
                            <img src="./src/assets/dgsc-logo.jpg" alt="logo" />
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 5, lineHeight: 1, gap: 5 }}>
                                {!isTablet && !isPhone && (
                                    <>
                                        <p style={{ color: "#034D7C" }}>Центр Поддержки</p>
                                        <p style={{ color: "#BF3437" }}>Электронного Правительства</p>
                                    </>
                                )}

                            </div>
                        </div>
                    </a>


                    <div className="about" style={{ display: 'flex', gap: isTablet || isPhone ? 20 : 40 }}>
                        <a href="https://govtec.kz">ГЛАВНАЯ</a>
                        <a href="https://govtec.kz/project-center">ДЕЯТЕЛЬНОСТЬ</a>
                        <a href="https://govtec.kz/curs">КУРСЫ</a>
                        <a href="https://govtec.kz/contacts">КОНТАКТЫ</a>
                    </div>
                </div>
            </Layout.Header>
        )
    }
}

export default AppHeader;