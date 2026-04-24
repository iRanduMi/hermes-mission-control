"""
Mission Control Task Manager

A simple client library for interacting with the Mission Control Kanban board.
Can be used from scripts, agents, or imported directly into Python sessions.

Usage:
    from mission_control_client import TaskClient
    
    # Initialize (reads MISSION_CONTROL_API_URL and MISSION_CONTROL_API_KEY from env)
    client = TaskClient()
    
    # Create a task
    task = client.create_task("Fix login bug", status="in_progress", priority="high")
    
    # Update a task
    client.update_task(task.id, status="done")
    
    # List tasks
    tasks = client.list_tasks(status="in_progress")
"""

import os
import json
import requests
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict

@dataclass
class Task:
    """Task model matching the Mission Control database schema."""
    id: int
    title: str
    description: str = ""
    status: str = "requested"
    priority: str = "medium"
    created_at: Optional[str] = None

class TaskClient:
    """
    Client for Mission Control REST API.
    
    Environment variables:
        MISSION_CONTROL_API_URL - Base URL (default: http://localhost:8000)
        MISSION_CONTROL_API_KEY - Your API key from .env file
    """
    
    VALID_STATUSES = [
        'todo', 'in_progress', 'review', 'done',
        'requested', 'plan_review', 'plan_approved',
        'on_hold', 'deployed', 'declined'
    ]
    
    VALID_PRIORITIES = ['low', 'medium', 'high', 'critical']
    
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize the client.
        
        Args:
            base_url - Mission Control API URL (reads MISSION_CONTROL_API_URL env var if not provided)
            api_key - Your API key (reads MISSION_CONTROL_API_KEY env var if not provided)
        """
        self.base_url = base_url or os.environ.get('MISSION_CONTROL_API_URL', 'http://localhost:8000')
        self.api_key = api_key or os.environ.get('MISSION_CONTROL_API_KEY')
        
        if not self.api_key:
            raise ValueError(
                "API key required. Set MISSION_CONTROL_API_KEY environment variable "
                "or pass api_key parameter. Get your API key from ~/.hermes/.env file."
            )
        
        # Remove trailing slash
        self.base_url = self.base_url.rstrip('/')
        
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an HTTP request with API key authentication."""
        url = f"{self.base_url}{endpoint}"
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        headers.update(kwargs.pop('headers', {}))
        
        response = requests.request(method, url, headers=headers, **kwargs)
        
        if response.status_code >= 400:
            error_msg = response.json().get('error', 'Unknown error')
            raise Exception(f"API Error ({response.status_code}): {error_msg}")
        
        return response.json()
    
    def create_task(
        self,
        title: str,
        description: str = "",
        status: str = "requested",
        priority: str = "medium"
    ) -> Task:
        """
        Create a new task.
        
        Args:
            title - Task title (required)
            description - Optional description
            status - One of: requested, plan_review, plan_approved, in_progress, on_hold,
                     deployed, declined, todo, review, done
            priority - One of: low, medium, high, critical
        
        Returns:
            Task object with server-assigned ID
        """
        if status not in self.VALID_STATUSES:
            raise ValueError(f"Invalid status '{status}'. Must be one of: {self.VALID_STATUSES}")
        if priority not in self.VALID_PRIORITIES:
            raise ValueError(f"Invalid priority '{priority}'. Must be one of: {self.VALID_PRIORITIES}")
        
        data = {
            'title': title,
            'description': description,
            'status': status,
            'priority': priority
        }
        
        result = self._request('POST', '/api/v1/tasks', json=data)
        task_data = result['task']
        return Task(**task_data)
    
    def get_task(self, task_id: int) -> Task:
        """
        Get a single task by ID.
        
        Args:
            task_id - The task ID
            
        Returns:
            Task object
        """
        result = self._request('GET', f'/api/v1/tasks/{task_id}')
        task_data = result['task']
        return Task(**task_data)
    
    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> Task:
        """
        Update an existing task.
        
        Args:
            task_id - The task ID
            title - New title (optional)
            description - New description (optional)
            status - New status (optional)
            priority - New priority (optional)
            
        Returns:
            Updated Task object
        """
        data = {}
        if title is not None:
            data['title'] = title
        if description is not None:
            data['description'] = description
        if status is not None:
            if status not in self.VALID_STATUSES:
                raise ValueError(f"Invalid status '{status}'. Must be one of: {self.VALID_STATUSES}")
            data['status'] = status
        if priority is not None:
            if priority not in self.VALID_PRIORITIES:
                raise ValueError(f"Invalid priority '{priority}'. Must be one of: {self.VALID_PRIORITIES}")
            data['priority'] = priority
        
        if not data:
            return self.get_task(task_id)
        
        result = self._request('PATCH', f'/api/v1/tasks/{task_id}', json=data)
        task_data = result['task']
        return Task(**task_data)
    
    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task.
        
        Args:
            task_id - The task ID
            
        Returns:
            True if deleted successfully
        """
        self._request('DELETE', f'/api/v1/tasks/{task_id}')
        return True
    
    def list_tasks(self, status: Optional[str] = None) -> List[Task]:
        """
        List all tasks, optionally filtered by status.
        
        Args:
            status - Filter by status (optional)
            
        Returns:
            List of Task objects
        """
        params = {}
        if status is not None:
            params['status'] = status
        
        result = self._request('GET', '/api/v1/tasks', params=params)
        return [Task(**task_data) for task_data in result['tasks']]
    
    def move_task(self, task_id: int, new_status: str) -> Task:
        """
        Move a task to a different status (shorthand for update_task with status).
        
        Args:
            task_id - The task ID
            new_status - The new status
            
        Returns:
            Updated Task object
        """
        return self.update_task(task_id, status=new_status)
