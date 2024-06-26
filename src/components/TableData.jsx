import React from "react";

function TableData({as_is, to_be, overall, isPhone}) {
    return (
        <table id="data-table" className={isPhone ? "table-data-phone" : "table-data"} >
            <thead>
                <tr>
                    <th>Код и параметр оптимизации</th>
                    <th>Показатель как есть</th>
                    <th>Показатель как будет</th>
                    <th>Эффект</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>CC: Неспосредственные контакты</td>
                    <td>{as_is.length === 0 ? 0 : as_is['CC']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['CC']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['CC']}%</td>
                </tr>
                <tr>
                    <td>CO: Опосредованные контакты</td>
                    <td>{as_is.length === 0 ? 0 : as_is['CO']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['CO']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['CO']}%</td>
                </tr>
                <tr>
                    <td>CS: Контакты с подрядчиками</td>
                    <td>{as_is.length === 0 ? 0 : as_is['CS']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['CS']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['CS']}%</td>
                </tr>
                <tr>
                    <td>DC: Входящие документы</td>
                    <td>{as_is.length === 0 ? 0 : as_is['DC']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['DC']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['DC']}%</td>
                </tr>
                <tr>
                    <td>DP: Порождаемые документы</td>
                    <td>{as_is.length === 0 ? 0 : as_is['DP']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['DP']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['DP']}%</td>
                </tr>
                <tr>
                    <td>S: Шаги</td>
                    <td>{as_is.length === 0 ? 0 : as_is['S']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['S']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['S']}%</td>
                </tr>
                <tr>
                    <td>R: Бизнес-роли</td>
                    <td>{as_is.length === 0 ? 0 : as_is['R']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['R']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['R']}%</td>
                </tr>
                <tr>
                    <td>M: Руководители</td>
                    <td>{as_is.length === 0 ? 0 : as_is['M']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['M']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['M']}%</td>
                </tr>
                <tr>
                    <td>T: Передачи</td>
                    <td>{as_is.length === 0 ? 0 : as_is['T']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['T']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['T']}%</td>
                </tr>
                <tr>
                    <td>Q: Перемещения</td>
                    <td>{as_is.length === 0 ? 0 : as_is['Q']}</td>
                    <td>{to_be.length === 0 ? 0 : to_be['Q']}</td>
                    <td>{overall.length === 0 ? 0 : overall['effect']['Q']}%</td>
                </tr>
                <tr>
                    <td><b>Сложность процесса (Ср)</b></td>
                    <td><b><p><b>{overall.length === 0 ? 0 : overall['as_is_complexity']}</b></p></b></td>
                    <td><b>{overall.length === 0 ? 0 : overall['to_be_complexity']}</b></td>
                    <td></td>
                </tr>
                <tr>
                    <td class="green">Относительная степень улучшений</td>
                    <td class="green"><p><b><em>{overall.length === 0 ? 0 : overall['improvement']}%</em></b></p></td>
                </tr>
            </tbody>
        </table>
    );
}

export default TableData;