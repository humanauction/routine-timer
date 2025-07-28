from .models import Routine, RoutineItem

SESSION_KEY = 'current_routine'


def get_current_routine(session):
    """Get the current routine data from the session"""
    return session.get('tasks', [])


def get_routine_name(session):
    """Get the current routine name from the session"""
    return session.get('routine_name', 'My Routine')


def set_routine_name(session, name):
    """Set the routine name in the session"""
    session['routine_name'] = name


def add_task(session, task, duration):
    """Add a task to the current session routine"""
    tasks = get_current_routine(session)
    tasks.append({
        'task': task,
        'duration': duration
    })
    session['tasks'] = tasks
    return tasks


def remove_task(session, index):
    """Remove a task by index from the session"""
    tasks = get_current_routine(session)
    if 0 <= index < len(tasks):
        tasks.pop(index)
        session['tasks'] = tasks
    return tasks


def reorder_tasks(session, new_order):
    """Reorder tasks based on a list of indices"""
    tasks = get_current_routine(session)
    reordered = []
    for index in new_order:
        if 0 <= index < len(tasks):
            reordered.append(tasks[index])
    session['tasks'] = reordered
    return reordered


def clear_routine(session) -> None:
    session.pop(SESSION_KEY, None)


def save_routine_to_db(user, name: str, tasks: list[dict]) -> Routine:
    """Save the current routine to the database"""
    routine = Routine.objects.create(user=user, name=name)
    for idx, item in enumerate(tasks):
        RoutineItem.objects.create(
            routine=routine,
            task=item['task'],
            duration=item['duration'],
            order=idx
        )
    return routine
