package com.sergio.domain.service.exception;

public class ServiceDeletionNotAllowedException extends RuntimeException {
  public ServiceDeletionNotAllowedException() {
    super("Service has appointments and cannot be deleted");
  }
}
