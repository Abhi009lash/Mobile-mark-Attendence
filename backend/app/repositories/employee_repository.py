from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.repositories.base import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self, db: Session):
        super().__init__(Employee, db)

    def get_by_user_id(self, user_id: int) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.user_id == user_id).first()

    def get_by_code(self, organization_id: int, employee_code: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(
            Employee.organization_id == organization_id,
            Employee.employee_code == employee_code
        ).first()

    def list_by_branch(self, organization_id: int, branch_id: int) -> List[Employee]:
        return self.db.query(Employee).filter(
            Employee.organization_id == organization_id,
            Employee.branch_id == branch_id
        ).all()
