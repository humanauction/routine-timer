from .models import Routine, RoutineItem

SESSION_KEY = 'current_routine'


def get_current_routine(session) -> list[dict]:
    return session.get(SESSION_KEY, [])


def add_task(session, task: str, duration: int) -> None:
    routine = get_current_routine(session)
    routine.append({'task': task, 'duration': duration})
    session[SESSION_KEY] = routine


def clear_routine(session) -> None:
    session.pop(SESSION_KEY, None)


def save_routine_to_db(user, name: str, tasks: list[dict]) -> Routine:
    routine = Routine.objects.create(user=user, name=name)
    for idx, item in enumerate(tasks):
        RoutineItem.objects.create(
            routine=routine,
            task=item['task'],
            duration=item['duration'],
            order=idx
        )
    return routine

