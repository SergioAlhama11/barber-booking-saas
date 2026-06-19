package com.sergio.domain.barber.exception;

public class BarberDeletionNotAllowedException extends RuntimeException {

  public BarberDeletionNotAllowedException() {
    super("Cannot delete barber with existing appointments");
  }
}
