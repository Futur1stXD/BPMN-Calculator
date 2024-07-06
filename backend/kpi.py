import xml.etree.ElementTree as ET
import re

namespaces = {
        'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
        'bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
        'dc': 'http://www.omg.org/spec/DD/20100524/DC',
        'di': 'http://www.omg.org/spec/DD/20100524/DI',
        'bioc': 'http://bpmn.io/schema/bpmn/biocolor/1.0',
        'color': 'http://bpmn.io/schema/bpmn/color/1.0'
    }

def find_groups(root):
    try:
        def get_bounds(element):
            bounds = element.find('dc:Bounds', namespaces)
            x = float(bounds.attrib['x'])
            y = float(bounds.attrib['y'])
            width = float(bounds.attrib['width'])
            height = float(bounds.attrib['height'])
            return x, y, width, height

        groups = root.findall(".//bpmn:group", namespaces)
        
        groups_data = {}

        for group in groups:
            if group is not None:
                group_id = group.attrib['id']
                group_shape = root.find(f".//bpmndi:BPMNShape[@bpmnElement='{group_id}']", namespaces)
                group_x, group_y, group_width, group_height = get_bounds(group_shape)

                def is_inside_group(obj_x, obj_y, obj_width, obj_height, grp_x, grp_y, grp_width, grp_height):
                    return (obj_x >= grp_x and
                            obj_y >= grp_y and
                            obj_x + obj_width <= grp_x + grp_width and
                            obj_y + obj_height <= grp_y + grp_height)

                elements_in_group = []
                for shape in root.findall(".//bpmndi:BPMNShape", namespaces):
                    element_id = shape.attrib['bpmnElement']
                    
                    x, y, width, height = get_bounds(shape)
                    
                    if is_inside_group(x, y, width, height, group_x, group_y, group_width, group_height):
                        if element_id != group_id:
                            elements_in_group.append(element_id)

                groups_data[group_id] = elements_in_group
        
        return groups_data

    except Exception as e:
        print(e)
        return [], []


def sub_process_elements(root): # Initializing counters and dictionaries
    try:
        target_ref_counts = {}
        unique_id_counts = {}

        # Define the namespaces for BPMN
        namespaces = {'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}

        # Collect end events, parallel gateways, subprocesses, sequence flows, flow node references, and system tasks
        endEvents = set(end_events(root))
        parallels, not_parallels = parallel_gateways(root)
        sub_process = root.findall('.//bpmn:subProcess', namespaces=namespaces)
        all_sequences = root.findall('.//bpmn:sequenceFlow', namespaces=namespaces)
        all_flow_node_refs = root.findall('.//bpmn:flowNodeRef', namespaces=namespaces)
        sys_tasks = set(system_tasks(root))

        # Initialize sets for subprocesses and gateways with multiple target references
        sub_process_array = set()
        gateways_with_multiple_target_refs = set()

        # Dictionary to store unique objects for each subprocess
        unique_objects_by_subprocess = {}

        # Iterate over each subprocess
        for subprocess in sub_process:
            subprocess_id = subprocess.get('id')
            children = list(subprocess)
            subproc_target_ref_counts = collect_target_refs(children)

            # Collect unique objects within the subprocess
            unique_objects = set()
            for child in children:
                if child.get('id') is not None:
                    if child.tag != '{http://www.omg.org/spec/BPMN/20100524/MODEL}sequenceFlow':
                        if child.get('id') not in endEvents:
                            all_flow_node_refs.append(child)
                    unique_objects.add(child.get('id'))

            # Store unique objects for the subprocess
            unique_objects_by_subprocess[subprocess_id] = unique_objects

            if subprocess_id not in sys_tasks:
                sub_process_array.add(subprocess_id)

            for node in subprocess.findall('.//bpmn:exclusiveGateway', namespaces=namespaces):
                node_id = node.get('id')
                if subproc_target_ref_counts.get(node_id, 0) >= 2:
                    gateways_with_multiple_target_refs.add(node_id)

        # Process sequence flows to count target references
        for seq in all_sequences:
            target_ref = seq.get('targetRef')
            target_ref_counts[target_ref] = target_ref_counts.get(target_ref, 0) + 1

        # Process flow node references to count unique IDs
        for node_ref in all_flow_node_refs:
            node_id = node_ref.text
            if node_id is not None:
                if not node_id.strip():
                    node_id = node_ref.get('id')
                if node_id in parallels:
                    unique_id_counts[node_id] = unique_id_counts.get(node_id, 0) + 1
                elif not node_id.startswith('Gateway') or target_ref_counts.get(node_id, 0) == 1:
                    unique_id_counts[node_id] = unique_id_counts.get(node_id, 0) + 1

        # Filter out non-parallel and system task IDs from unique_id_counts
        for unique in list(unique_id_counts.keys()):
            if unique in not_parallels:
                unique_id_counts.pop(unique)
            for task in sys_tasks:
                if unique == task:
                    unique_id_counts.pop(unique)
        unique_objects_by_subprocess = {k: v for k, v in unique_objects_by_subprocess.items() if v}
        return unique_objects_by_subprocess    
    except Exception as e:
        print(e)
        return {}


def end_events(root) -> list:
    try:
        all_end_events = root.findall('.//bpmn:endEvent', namespaces)

        intermediateThrowEvent = root.findall('.//bpmn:intermediateThrowEvent', namespaces)

        endEvents = []
        for end_event in all_end_events:

            children = list(end_event)
            
            if len(children) < 2:
                endEvents.append(end_event.get('id'))
        
        for intermediate in intermediateThrowEvent:
            message_event_def = intermediate.find('.//bpmn:messageEventDefinition', namespaces)
            if message_event_def is None:
                endEvents.append(intermediate.get('id'))

        startEvents = root.findall('.//bpmn:startEvent', namespaces)
        for start in startEvents:
            children = list(start)
            if len(children) == 1 and children[0].tag == '{http://www.omg.org/spec/BPMN/20100524/MODEL}outgoing':
                endEvents.append(start.get('id'))

        sys_tasks = system_tasks(root)
        final_end_events = []
        for end in endEvents:
            if end not in sys_tasks:
                final_end_events.append(end)
        
        return final_end_events
    
    except Exception as e:
        print(e)
        return []
    
def collect_target_refs(children):
    try:
        subproc_target_ref_counts = {}
        for child in children:
            if child.tag == '{http://www.omg.org/spec/BPMN/20100524/MODEL}sequenceFlow':
                target_ref = child.get('targetRef')
                if target_ref not in subproc_target_ref_counts:
                    subproc_target_ref_counts[target_ref] = 0
                subproc_target_ref_counts[target_ref] += 1
        return subproc_target_ref_counts
    except Exception as e:
        print(e)
        return {}
    
def parallel_gateways(root):
    try:
        parallels = []
        not_parallels = []

        sys_tasks = system_tasks(root)

        target_refs = [sf.get('targetRef') for sf in root.findall('.//bpmn:sequenceFlow', namespaces)]

        target_ref_count = {}
        for target_ref in target_refs:
            if target_ref in target_ref_count:
                target_ref_count[target_ref] += 1
            else:
                target_ref_count[target_ref] = 1

        all_parallel_gateways = root.findall('.//bpmn:parallelGateway', namespaces)
        for parallel in all_parallel_gateways:
            id = parallel.get('id')
            if id in target_ref_count.keys():
                if id not in sys_tasks:
                    if target_ref_count[id] > 1:
                        parallels.append(id)
                    else:
                        not_parallels.append(id)
                
        return parallels, not_parallels
    except Exception as e:
        print(e)
        return [], []

def contractor_contacts(root):
    try:
        all_participants = root.findall('.//bpmn:participant', namespaces)
        message_flows = root.findall('.//bpmn:messageFlow', namespaces)

        groups = find_groups(root)
        
        all_contractors = []
        contractors = []

        for participant in all_participants:
            participant_name = participant.get('name')
            if participant_name is not None:
                if '(Подрядчик)' in participant_name:
                    all_contractors.append(participant.get('id'))

        added_messages_by_group = {group: [] for group in groups}
        
        for message in message_flows:
            source = message.get('sourceRef')
            target = message.get('targetRef')

            
            if source in all_contractors or target in all_contractors:
                added = False
                for group, elements in groups.items():
                    if source in elements or target in elements:
                        if message not in added_messages_by_group[group]:
                            contractors.append(message)
                            added_messages_by_group[group].append(message)
                            added = True
                            break
                if not added:
                    contractors.append(message)

        added_messages_by_group = {group: messages for group, messages in added_messages_by_group.items() if messages}

        for group, messages in added_messages_by_group.items():
            for message in messages:
                if message in contractors:
                    contractors.remove(message)

        for group, messages in added_messages_by_group.items():
            if messages:
                contractors.append(messages[0])
        
        return contractors
    
    except Exception as e:
        print(e)
        return []

def eventBasedGateways(root) -> list:
    try:
        event_based = root.findall('.//bpmn:eventBasedGateway', namespaces)
        sys_tasks = system_tasks(root)
        event_based_id = []

        for event in event_based:
            id = event.get('id')

            if id not in sys_tasks:
                event_based_id.append(id)

        return event_based_id

    except Exception as e:
        print(e)
        return []

def system_tasks(root):
    try:
        tasks = []

        lanes = root.findall('.//bpmn:lane', namespaces)
        
        lanes_with_sys = [lane for lane in lanes if "(ИС)" in lane.attrib.get('name', '')]
        
        tasks_on_sys = {node_ref.text for lane in lanes_with_sys for node_ref in lane.findall('.//bpmn:flowNodeRef', namespaces)}

        for sys_task in tasks_on_sys:
            tasks.append(sys_task)

        sub_process = root.findall('.//bpmn:subProcess', namespaces)
        
        for subprocess in sub_process:
            if subprocess.get('id') in tasks:
                children = list(subprocess)
                for child in children:
                    if child.get('id') is not None:
                        tasks.append(child.get('id'))
        
        return tasks
    
    except Exception as e:
        print(e)
        return []


def business_roles(root):    
    try:
        all = root.findall('.//bpmn:lane', namespaces)
        excluded_lanes = [lane for lane in all if "(ИС)" in lane.attrib.get('name', '')]

        return len(all) - len(excluded_lanes)
    
    except Exception as e:
        print(e)
        return 0


def direct_indirect_contacts(root): 
    try: 
        message_flows = root.findall('.//bpmn:messageFlow', namespaces)
        all_participants = root.findall('.//bpmn:participant', namespaces)
        all_contractors = []
        contractors = []
        for participant in all_participants:
            participant_name = participant.get('name')
            if participant_name is not None:
                if '(Подрядчик)' in participant_name:
                    all_contractors.append(participant.get('id'))

        for message in message_flows:
            source = message.get('sourceRef')
            target = message.get('targetRef')

            if source in all_contractors or target in all_contractors:
                contractors.append(message)

        contractors = set(contractors)
        if contractors is not None:
            sys_task = set(system_tasks(root))
            
            direct_contacts = 0
            sys_tasks = system_tasks(root)

            groups_data = find_groups(root)

            groups = []
            element_in_groups = []
            groups_in_sys = []
            element_in_groups_sys = []

            elemented_contacted_group = []
            elemented_contacted_group_sys = []

            for group, tasks in groups_data.items(): 
                for task in tasks:
                    if task not in sys_tasks:
                        element_in_groups.append(task)
                        if group not in groups:
                            groups.append(group)
                    else:
                        element_in_groups_sys.append(task)
                        if group not in groups_in_sys:
                            groups_in_sys.append(group)
            
            remaining_flows = []
            
            for message in message_flows:
                source = message.get('sourceRef')
                target = message.get('targetRef')

                if message in contractors or message in contractors:
                    continue 
                
                if source in element_in_groups or target in element_in_groups:
                    elemented_contacted_group.append(source)
                    elemented_contacted_group.append(target)
                    continue 

                if source in element_in_groups_sys or target in element_in_groups_sys:
                    elemented_contacted_group_sys.append(source)
                    elemented_contacted_group_sys.append(target)
                    continue  
                
                if source in sys_task or target in sys_task:
                    direct_contacts += 1
                else:
                    remaining_flows.append(message.get('id'))
            
            contacted_group = []
            for group, elements in groups_data.items():
                for element in elemented_contacted_group:
                    if element in elements:
                        contacted_group.append(element)
                        break
            
            contacted_group_sys = []
            for group, elements in groups_data.items():
                for element in elemented_contacted_group_sys:
                    if element in elements:
                        contacted_group_sys.append(element)
                        break
            
            direct_contacts += len(contacted_group_sys)
            indirect_contacts = len(remaining_flows) + len(contacted_group)
            
            return [indirect_contacts, direct_contacts]
    except Exception as e:
        print(e)
        return []


def incoming_documents(root):
    try:
        orange = len(root.findall(".//*[@bioc:stroke='#6b3c00']", namespaces))
        light_orange = len(root.findall(".//*[@bioc:stroke='#fb8c00']", namespaces))
        
        pattern = re.compile(r'\(DC:(\d+)\)')
        pattern_1 = re.compile(r'\(DC: (\d+)\)')
        founded_doc_text_format = []
        
        for text_annotation in root.findall('.//bpmn:text', namespaces):
            text = text_annotation.text
            matches = pattern.findall(text)
            if matches:
                for match in matches:
                    founded_doc_text_format.append(int(match))
            else:
                matches = pattern_1.findall(text)
                for match in matches:
                    founded_doc_text_format.append(int(match))
        
        if founded_doc_text_format:
            return founded_doc_text_format[0]
        else:
            return orange + light_orange
    
    except Exception as e:
        print(e)
        return 0


def generated_documents(root):
    try:
        all_lanes = root.findall(".//bpmn:lane", namespaces=namespaces)
        
        all_blue_elements = root.findall(".//*[@bioc:stroke='#1e88e5']", namespaces=namespaces)
        all_blue_light_elements = root.findall(".//*[@bioc:stroke='#0d4372']", namespaces=namespaces)

        subprocess = root.findall('.//bpmn:subProcess', namespaces)
        subprocess_sys_count = 0
        for sub in subprocess:
            if sub is not None:
                id = sub.get('id')

                # If we have SUB PROCESS with blue color
                sub_proc = root.find(".//*[@id='{}']".format(id + '_di'))
                if sub_proc is not None:
                    color = sub_proc.get('{http://www.omg.org/spec/BPMN/non-normative/color/1.0}background-color')

                    if color == '#bbdefb':
                        subprocess_sys_count += 1

        counter = 0
        for lane in all_lanes:
            if lane is not None:
                lane_id = lane.get('id')

                # If we have SYSTEM with blue color
                lane = root.find(".//*[@id='{}']".format(lane_id + '_di'))
                if lane is not None:
                    color = lane.get('{http://www.omg.org/spec/BPMN/non-normative/color/1.0}background-color')

                    if color == '#bbdefb':
                        counter += 1
        
        counter += subprocess_sys_count

        return len(all_blue_elements) + len(all_blue_light_elements) - counter
    
    except Exception as e:
        print(e)
        return 0


def steps(root) -> int:
    try: 
        counter = 0
        target_ref_counts = {}
        source_ref_counts = {}
        unique_gateways = set()

        sys_tasks = system_tasks(root)

        all_sequences = root.findall('.//bpmn:sequenceFlow', namespaces)
        all_flow_node_refs = root.findall('.//bpmn:flowNodeRef', namespaces)
        sub_process = root.findall('.//bpmn:subProcess', namespaces)

        endEvents = end_events(root)

        sub_process_array = []
        gateways_with_multiple_target_refs = set()

        for subprocess in sub_process:
            children = list(subprocess)
            subproc_target_ref_counts = collect_target_refs(children)

            for child in children:
                if child.get('id') is not None:
                    if child.tag != '{http://www.omg.org/spec/BPMN/20100524/MODEL}sequenceFlow':
                        if child.get('id') not in endEvents:
                            all_flow_node_refs.append(child)
            if subprocess.get('id') not in sys_tasks:
                sub_process_array.append(subprocess.get('id'))

            for node in subprocess.findall('.//bpmn:exclusiveGateway', namespaces):
                node_id = node.get('id')
                if subproc_target_ref_counts.get(node_id, 0) >= 2:
                    gateways_with_multiple_target_refs.add(node_id)

        for seq in all_sequences:
            target_ref = seq.get('targetRef')
            if target_ref not in target_ref_counts:
                target_ref_counts[target_ref] = 0
            target_ref_counts[target_ref] += 1

            source_ref = seq.get('sourceRef')
            if source_ref:
                if source_ref not in source_ref_counts:
                    source_ref_counts[source_ref] = 0
                source_ref_counts[source_ref] += 1
        
        # for if gateway have 1 source and 1 ref
        for target in list(target_ref_counts):
            if target_ref_counts.get(target, 0) == 1 and source_ref_counts.get(target, 0) == 1:
                del target_ref_counts[target]
                
        unique_ref = []
        for node_ref in all_flow_node_refs:
            node_id = node_ref.text
            if node_id is not None:
                if not node_id.strip():
                    node_id = node_ref.get('id')
                if node_id not in sys_tasks:
                    unique_ref.append(node_id)

        sub_proc = sub_process_elements(root)
        filtered_sup_proc = {k: v for k, v in sub_proc.items() if v}
        filtered_sup_proc = list(filtered_sup_proc)
        parallels, not_parallels = parallel_gateways(root)

        for node_id in unique_ref:
            if node_id not in endEvents:
                if node_id not in filtered_sup_proc and node_id not in gateways_with_multiple_target_refs:
                    if node_id in parallels:
                        unique_gateways.add(node_id)
                    elif not node_id.startswith('Gateway'):
                        counter += 1
                    elif target_ref_counts.get(node_id, 0) == 1:
                        if node_id not in not_parallels:
                            unique_gateways.add(node_id)
                            
        counter += len(unique_gateways)
        counter -= len(eventBasedGateways(root))

        return counter
    except Exception as e:
        print(e)
        return 0


def managers(root) -> int:
    try:
        counter = 0
        target_ref_counts = {}
        source_ref_counts = {}
        unique_id_counts = {}

        namespaces = {'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}

        endEvents = set(end_events(root))
        parallels, not_parallels = parallel_gateways(root)
        sub_process = root.findall('.//bpmn:subProcess', namespaces=namespaces)
        all_sequences = root.findall('.//bpmn:sequenceFlow', namespaces=namespaces)
        all_flow_node_refs = root.findall('.//bpmn:flowNodeRef', namespaces=namespaces)
        sys_tasks = set(system_tasks(root))

        sub_process_array = set()
        gateways_with_multiple_target_refs = set()

        for subprocess in sub_process:
            children = list(subprocess)
            subproc_target_ref_counts = collect_target_refs(children)

            for child in children:
                if child.get('id') is not None:
                    if child.tag != '{http://www.omg.org/spec/BPMN/20100524/MODEL}sequenceFlow':
                        if child.get('id') not in endEvents:
                            all_flow_node_refs.append(child)

            if subprocess.get('id') not in sys_tasks:
                sub_process_array.add(subprocess.get('id'))

            for node in subprocess.findall('.//bpmn:exclusiveGateway', namespaces=namespaces):
                node_id = node.get('id')
                if subproc_target_ref_counts.get(node_id, 0) >= 2:
                    gateways_with_multiple_target_refs.add(node_id)
        
        for seq in all_sequences:
            target_ref = seq.get('targetRef')
            target_ref_counts[target_ref] = target_ref_counts.get(target_ref, 0) + 1

            source_ref = seq.get('sourceRef')
            if source_ref:
                if source_ref not in source_ref_counts:
                    source_ref_counts[source_ref] = 0
                source_ref_counts[source_ref] += 1

        # for if gateway have 1 source and 1 ref
        for target in list(target_ref_counts):
            if target_ref_counts.get(target, 0) == 1 and source_ref_counts.get(target, 0) == 1:
                del target_ref_counts[target]
        
        for node_ref in all_flow_node_refs:
            node_id = node_ref.text
            if node_id is not None:
                if not node_id.strip():
                    node_id = node_ref.get('id')
                if node_id in parallels:
                    unique_id_counts[node_id] = unique_id_counts.get(node_id, 0) + 1
                elif not node_id.startswith('Gateway') or target_ref_counts.get(node_id, 0) == 1:
                    unique_id_counts[node_id] = unique_id_counts.get(node_id, 0) + 1

        lanes = root.findall('.//bpmn:lane', namespaces=namespaces)
        
        for unique in list(unique_id_counts.keys()):
            if unique in not_parallels:
                unique_id_counts.pop(unique)
            for task in sys_tasks:
                if unique == task:
                    unique_id_counts.pop(unique)

        eventBased = set(eventBasedGateways(root))

        multiplied = set()

        sub_proc_elements = sub_process_elements(root)

        for lane in lanes:
            lane_name = lane.get('name')
            multiplier = int(re.search(r'\((\d+)\)', lane_name).group(1)) if re.search(r'\((\d+)\)', lane_name) else 1

            flow_node_refs = lane.findall('.//bpmn:flowNodeRef', namespaces=namespaces)

            for ref in flow_node_refs:
                ref_id = ref.text
                if ref_id in unique_id_counts:
                    if ref_id not in endEvents:
                        if ref_id not in eventBased:
                            if ref_id not in sub_process_array and ref_id not in gateways_with_multiple_target_refs:
                                if ref_id not in multiplied:
                                    if multiplier != 1:
                                        multiplied.add(ref_id)
                                        counter += multiplier * unique_id_counts[ref_id]

                if ref_id in sub_process_array:
                    for subprocess_id, unique_objects in sub_proc_elements.items():
                        if subprocess_id == ref_id:
                            matching_objects = unique_objects.intersection(unique_id_counts.keys())
                            if matching_objects:
                                for id in matching_objects:
                                    if id not in endEvents:
                                        if id not in eventBased:
                                            if id not in multiplied:
                                                if multiplier != 1:
                                                    multiplied.add(id)
                                                    counter += multiplier * unique_id_counts[id]
        return counter
    except Exception as e:
        print(e)
        return 0

def transfers(root) -> int:
    try:
        sequence_flows = root.findall('.//bpmn:sequenceFlow', namespaces)

        bpmn_shapes = root.findall('.//bpmndi:BPMNShape', namespaces)
        element_positions = {shape.attrib['bpmnElement']: (
            float(bounds.attrib['x']) + float(bounds.attrib['width']) / 2, 
            float(bounds.attrib['y']) + float(bounds.attrib['height']) / 2
        ) for shape in bpmn_shapes if (bounds := shape.find('.//dc:Bounds', namespaces)) is not None}
        
        lane_dict = {}
        for lane in root.findall('.//bpmn:lane', namespaces):
            lane_id = lane.attrib['id']
            lane_dict[lane_id] = []
            for flow_node_ref in lane.findall('.//bpmn:flowNodeRef', namespaces):
                lane_dict[lane_id].append(flow_node_ref.text)

        vertical_connections = 0
        sys_tasks = system_tasks(root)

        for flow in sequence_flows:
            source_ref = flow.attrib['sourceRef']
            target_ref = flow.attrib['targetRef']

            if target_ref not in sys_tasks and source_ref in element_positions and target_ref in element_positions:
                source_position = element_positions[source_ref]
                target_position = element_positions[target_ref]

                source_lane = next((lane_id for lane_id, nodes in lane_dict.items() if source_ref in nodes), None)
                target_lane = next((lane_id for lane_id, nodes in lane_dict.items() if target_ref in nodes), None)

                if source_position[0] == target_position[0] and source_lane != target_lane:
                    vertical_connections += 1

        bpmn_edges = root.findall('.//bpmndi:BPMNEdge', namespaces)
        curved_vertical = 0

        for flow in sequence_flows:
            source_ref = flow.attrib['sourceRef']
            target_ref = flow.attrib['targetRef']

            # Проверяем, что target не является системной задачей и что элементы имеют позиции
            if target_ref not in sys_tasks and source_ref in element_positions and target_ref in element_positions:
                source_position = element_positions[source_ref]
                target_position = element_positions[target_ref]

                # Находим, к каким lane принадлежат source и target
                source_lane = next((lane_id for lane_id, nodes in lane_dict.items() if source_ref in nodes), None)
                target_lane = next((lane_id for lane_id, nodes in lane_dict.items() if target_ref in nodes), None)

                # Проверяем, что source и target принадлежат разным lanes
                if source_lane != target_lane:
                    # Ищем edge, соответствующий текущему flow
                    edge = next((e for e in bpmn_edges if e.attrib['bpmnElement'] == flow.attrib['id']), None)
                    if edge is not None:
                        waypoints = edge.findall('.//di:waypoint', namespaces)
                        if len(waypoints) > 2:
                            for i in range(len(waypoints) - 1):
                                x1, y1 = float(waypoints[i].attrib['x']), float(waypoints[i].attrib['y'])
                                x2, y2 = float(waypoints[i + 1].attrib['x']), float(waypoints[i + 1].attrib['y'])
                                # Проверяем, что точки образуют вертикальную кривую
                                if abs(x1 - x2) < 1e-2 and y1 != y2:
                                    curved_vertical += 1
                                    break

        return vertical_connections + curved_vertical
    
    except Exception as e:
        print(e)
        return 0
    
def moving(root) -> int:
    try:
        counter = 0
        movings = root.findall('.//bpmn:textAnnotation/bpmn:text', namespaces)
        
        for moving in movings:
            if moving.text == '(Перемещение)':
                counter += 1

        return counter
    except Exception as e:
        print(e)
        return 0


def main_calculations(contents) -> dict:
    try:
        result = { 'CC': 0, 'CO': 0, 'CS': 0, 'DC': 0, 'DP': 0, 'S': 0, 'R': 0, 'M': 0, 'T': 0, 'Q': 0 }

        root = ET.fromstring(contents)

        contacts = direct_indirect_contacts(root)
        contractors = contractor_contacts(root)
        if contractors is not None:
            result['CC'] = contacts[0]
            result['CO'] = contacts[1]
            result['CS'] = len(contractors)
        result['DC'] = incoming_documents(root)
        result['DP'] = generated_documents(root)
        result['S'] = steps(root)
        result['R'] = business_roles(root)
        result['M'] = managers(root)
        result['T'] = transfers(root)
        result['Q'] = moving(root)

        return result
    except Exception as e:
        print(e)